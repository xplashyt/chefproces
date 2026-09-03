/**
 * POST /api/wompi/pay
 *
 * Crea la transacción en Wompi. Recibe del navegador el id del plan y un token
 * de tarjeta (opaco), NUNCA el monto ni los datos de la tarjeta:
 *
 *  - el monto lo pone el servidor leyendo lib/plans.ts, porque cualquier cosa
 *    que venga del cliente es manipulable (si el navegador mandara el precio,
 *    alguien pagaría $1.000 por el plan de $89.900);
 *  - la tarjeta ya fue tokenizada contra Wompi desde el navegador, así que este
 *    servidor jamás toca un PAN ni un CVC.
 */

import { NextResponse } from 'next/server';

import {
  esCuotaValida,
  esTipoDocumento,
  soloDigitos,
  validarCelular,
  validarCorreo,
  validarDocumento,
  validarNombre,
  limpiarEspacios,
} from '@/lib/payment-options';
import type { CodigoErrorPago } from '@/lib/payment-errors';
import { buscarPlan, precioEnCentavos } from '@/lib/plans';
import { construirReferencia } from '@/lib/reference';
import { variablesFaltantes } from '@/lib/server-env';
import { crearTransaccion, ErrorPasarela, obtenerTokensAceptacion } from '@/lib/wompi-server';

export const dynamic = 'force-dynamic';

/**
 * Status HTTP por tipo de falla de la PASARELA (ver lib/payment-errors.ts).
 * Lo que no está listado (o un `Error` que no sea `ErrorPasarela`) cae en 502:
 * falla del lado de Wompi, no de quien pide.
 */
const HTTP_POR_CODIGO: Partial<Record<CodigoErrorPago, number>> = {
  ACCESO_BLOQUEADO: 403,
  DEMASIADOS_INTENTOS: 429,
  CONFIGURACION_INVALIDA: 500,
  SOLICITUD_INVALIDA: 422,
  PASARELA_NO_DISPONIBLE: 502,
  SIN_CONEXION: 502,
};

interface CuerpoPago {
  plan?: unknown;
  tokenTarjeta?: unknown;
  cuotas?: unknown;
  nombre?: unknown;
  correo?: unknown;
  celular?: unknown;
  tipoDocumento?: unknown;
  numeroDocumento?: unknown;
  aceptaTerminos?: unknown;
}

function error(mensaje: string, status: number) {
  return NextResponse.json({ mensaje }, { status });
}

export async function POST(peticion: Request) {
  // Si falta configuración, es mejor decirlo claro que fallar con un stack
  // trace: este mensaje solo se ve en desarrollo mal configurado.
  const faltantes = variablesFaltantes();
  if (faltantes.length > 0) {
    console.error('[pay] variables de entorno faltantes:', faltantes.join(', '));
    return error('El sitio no está configurado para cobrar todavía. Escríbenos y lo resolvemos.', 500);
  }

  let cuerpo: CuerpoPago;
  try {
    cuerpo = (await peticion.json()) as CuerpoPago;
  } catch {
    return error('No entendimos la solicitud.', 400);
  }

  // El plan define el precio: es lo único "económico" que aceptamos del cliente.
  const plan = buscarPlan(cuerpo.plan);
  if (!plan) return error('Ese plan no existe.', 400);

  if (typeof cuerpo.tokenTarjeta !== 'string' || cuerpo.tokenTarjeta.length < 8) {
    return error('Falta el token de la tarjeta. Recarga la página e intenta otra vez.', 400);
  }

  if (!esCuotaValida(cuerpo.cuotas)) return error('El número de cuotas no es válido.', 400);
  const cuotas = Number(cuerpo.cuotas);

  if (cuerpo.aceptaTerminos !== true) {
    return error('Debes aceptar los términos y la autorización de datos.', 400);
  }

  const nombre = limpiarEspacios(String(cuerpo.nombre ?? ''));
  const correo = String(cuerpo.correo ?? '').trim().toLowerCase();
  const celular = soloDigitos(String(cuerpo.celular ?? ''));
  const numeroDocumento = soloDigitos(String(cuerpo.numeroDocumento ?? ''));
  const tipoDocumento = cuerpo.tipoDocumento;

  // Se revalida TODO con las mismas funciones que usó el formulario: el
  // navegador puede saltarse su propia validación con dos líneas de consola.
  const problema =
    validarNombre(nombre) ??
    validarCorreo(correo) ??
    validarCelular(celular) ??
    validarDocumento(numeroDocumento) ??
    (esTipoDocumento(tipoDocumento) ? null : 'El tipo de documento no es válido.');

  if (problema) return error(problema, 400);
  if (!esTipoDocumento(tipoDocumento)) return error('El tipo de documento no es válido.', 400);

  try {
    // Los tokens de aceptación se piden aquí, en el momento del cobro, porque
    // caducan: si el formulario estuvo abierto media hora, el que tenía el
    // cliente podría estar vencido.
    const tokens = await obtenerTokensAceptacion();

    // La referencia carga el plan dentro de sí misma; es lo que permite
    // entregar el acceso correcto cuando llega el webhook, sin base de datos.
    const referencia = construirReferencia(plan.id);

    const transaccion = await crearTransaccion({
      referencia,
      montoEnCentavos: precioEnCentavos(plan),
      correo,
      nombreCompleto: nombre,
      celular,
      tipoDocumento,
      numeroDocumento,
      tokenTarjeta: cuerpo.tokenTarjeta,
      cuotas,
      tokenAceptacion: tokens.aceptacion,
      tokenDatosPersonales: tokens.datosPersonales,
    });

    return NextResponse.json(
      {
        id: transaccion.id,
        estado: transaccion.estado,
        referencia: transaccion.referencia,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (fallo) {
    if (fallo instanceof ErrorPasarela) {
      // Clasificado: sabemos si fue la red, un bloqueo de la pasarela (WAF/IP),
      // rate limiting, configuración inválida, etc. Ver lib/payment-errors.ts.
      console.error('[pay] el pago no se pudo iniciar', { codigo: fallo.codigo, mensaje: fallo.message });
      return error(fallo.message, HTTP_POR_CODIGO[fallo.codigo] ?? 502);
    }

    // Errores de validación de Wompi (lib/wompi-server.ts los deja como Error
    // simple con el texto ya legible) u otra excepción no anticipada.
    console.error('[pay] no se pudo crear la transacción', fallo);
    return error(
      fallo instanceof Error && fallo.message
        ? fallo.message
        : 'No pudimos procesar el pago en este momento. No se te cobró nada; intenta de nuevo.',
      502,
    );
  }
}
