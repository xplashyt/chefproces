/**
 * Tokenización de tarjeta EN EL NAVEGADOR.
 *
 * Los datos sensibles (número, CVC) van directo del navegador a Wompi con la
 * llave pública. Nuestro servidor nunca los ve, así que el sitio queda fuera
 * del alcance más pesado de PCI-DSS: lo único que recibimos es un token
 * opaco de un solo uso.
 *
 * Solo importa wompi-endpoint.ts (sin dependencias) para no arrastrar módulos
 * de Node al bundle del cliente.
 */

import { clasificarErrorGateway } from '@/lib/payment-errors';
import { wompiBaseUrl } from '@/lib/wompi-endpoint';

export interface DatosTarjeta {
  numero: string;
  cvc: string;
  mes: string;
  anio: string;
  titular: string;
}

export interface TokenTarjeta {
  id: string;
  ultimosCuatro: string;
  marca: string;
}

/** Error con mensaje ya en español, listo para mostrar en el formulario. */
export class ErrorWompi extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorWompi';
  }
}

export async function tokenizarTarjeta(
  llavePublica: string,
  datos: DatosTarjeta,
): Promise<TokenTarjeta> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${wompiBaseUrl(llavePublica)}/tokens/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // La llave pública va como Bearer: es su único uso legítimo.
        Authorization: `Bearer ${llavePublica}`,
      },
      body: JSON.stringify({
        number: datos.numero,
        cvc: datos.cvc,
        exp_month: datos.mes,
        exp_year: datos.anio,
        card_holder: datos.titular,
      }),
    });
  } catch {
    // El navegador nunca llegó a Wompi: sin internet, DNS, o un bloqueador de
    // contenido cortó la petición. Esto NO es un problema de la tarjeta, y sin
    // este catch el fetch fallido se propagaba crudo (p. ej. "Failed to
    // fetch") hasta la pantalla de la compradora.
    const clasificado = clasificarErrorGateway({ redCaida: true });
    throw new ErrorWompi(`${clasificado.mensaje} ${clasificado.consejo ?? ''}`.trim());
  }

  const textoCrudo = await respuesta.text().catch(() => '');
  let cuerpo: {
    status?: string;
    data?: { id?: string; last_four?: string; brand?: string };
    error?: { type?: string; reason?: unknown; messages?: unknown };
  } | null = null;
  try {
    cuerpo = textoCrudo ? JSON.parse(textoCrudo) : null;
  } catch {
    cuerpo = null;
  }

  if (!respuesta.ok || !cuerpo?.data?.id) {
    // Si Wompi devolvió su formato habitual de error de VALIDACIÓN, ese
    // detalle sí es sobre la tarjeta. Si no —403/429/5xx, o una respuesta que
    // ni siquiera es JSON, típico de un bloqueo de WAF—, el problema es la
    // pasarela o la conexión, no lo que se escribió, y hay que decirlo así en
    // vez de siempre culpar al número de la tarjeta.
    const mensajes = cuerpo?.error?.messages;
    const detalle =
      mensajes && typeof mensajes === 'object'
        ? Object.values(mensajes as Record<string, unknown>).flat().join(' ')
        : typeof cuerpo?.error?.reason === 'string'
          ? cuerpo.error.reason
          : '';

    if (detalle) {
      throw new ErrorWompi(`Revisa los datos de la tarjeta: ${detalle}`);
    }

    const clasificado = clasificarErrorGateway({
      httpStatus: respuesta.status,
      wompiErrorType: cuerpo?.error?.type ?? null,
      respuestaNoJson: cuerpo === null && textoCrudo.length > 0,
    });
    throw new ErrorWompi(`${clasificado.mensaje} ${clasificado.consejo ?? ''}`.trim());
  }

  return {
    id: cuerpo.data.id,
    ultimosCuatro: cuerpo.data.last_four ?? '',
    marca: cuerpo.data.brand ?? '',
  };
}

export interface TokensAceptacion {
  aceptacion: string;
  permalinkAceptacion: string;
  datosPersonales: string;
  permalinkDatosPersonales: string;
}

/**
 * Pide los tokens de aceptación a NUESTRA ruta (no directo a Wompi) para tener
 * un solo origen de red desde el formulario y poder cachear en el servidor.
 */
export async function obtenerTokensAceptacion(): Promise<TokensAceptacion> {
  const respuesta = await fetch('/api/wompi/acceptance', { cache: 'no-store' });
  if (!respuesta.ok) {
    throw new ErrorWompi('No pudimos cargar los términos de la pasarela. Recarga la página.');
  }
  return (await respuesta.json()) as TokensAceptacion;
}
