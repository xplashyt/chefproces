/**
 * Todo lo de Wompi que exige secretos: firma de integridad, creación de la
 * transacción, consulta de estado y verificación de la firma de los eventos.
 *
 * `server-only` hace que el build falle si alguien lo importa por accidente
 * desde un componente cliente. Es una red de seguridad barata para no filtrar
 * la llave privada al navegador.
 */

import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

import { MONEDA } from '@/lib/plans';
import type { EstadoTransaccion, TipoDocumento } from '@/lib/payment-options';
import { entornoWompi } from '@/lib/server-env';
import { wompiBaseUrl } from '@/lib/wompi-endpoint';

function sha256(texto: string): string {
  return createHash('sha256').update(texto, 'utf8').digest('hex');
}

/**
 * Firma de integridad: SHA-256 de referencia + monto + moneda + secreto.
 *
 * Es lo que impide que alguien edite el JavaScript y compre el plan de $89.900
 * pagando $1.000: Wompi recalcula esta firma con su copia del secreto y, si el
 * monto no cuadra, rechaza la transacción. Por eso el monto SIEMPRE lo pone el
 * servidor leyendo lib/plans.ts, nunca el navegador.
 */
export function firmarIntegridad(referencia: string, montoEnCentavos: number): string {
  const { secretoIntegridad } = entornoWompi();
  return sha256(`${referencia}${montoEnCentavos}${MONEDA}${secretoIntegridad}`);
}

export interface TokensAceptacionWompi {
  aceptacion: string;
  permalinkAceptacion: string;
  datosPersonales: string;
  permalinkDatosPersonales: string;
}

/**
 * Los permalinks son los contratos que la usuaria debe aceptar (términos de la
 * pasarela y autorización de datos personales). Wompi los entrega firmados y
 * con vencimiento, así que se piden en caliente, no se hardcodean.
 */
export async function obtenerTokensAceptacion(): Promise<TokensAceptacionWompi> {
  const { llavePublica } = entornoWompi();
  const respuesta = await fetch(`${wompiBaseUrl(llavePublica)}/merchants/${llavePublica}`, {
    // Sin caché: el token de aceptación caduca y uno vencido tumba el pago.
    cache: 'no-store',
  });

  if (!respuesta.ok) {
    throw new Error(`Wompi respondió ${respuesta.status} al pedir los tokens de aceptación.`);
  }

  const cuerpo = (await respuesta.json()) as {
    data?: {
      presigned_acceptance?: { acceptance_token?: string; permalink?: string };
      presigned_personal_data_auth?: { acceptance_token?: string; permalink?: string };
    };
  };

  const aceptacion = cuerpo.data?.presigned_acceptance;
  const datos = cuerpo.data?.presigned_personal_data_auth;

  if (!aceptacion?.acceptance_token) {
    throw new Error('Wompi no devolvió el token de aceptación.');
  }

  return {
    aceptacion: aceptacion.acceptance_token,
    permalinkAceptacion: aceptacion.permalink ?? '',
    // Algunos comercios no tienen el de datos personales habilitado: si falta,
    // se manda vacío y simplemente no se envía ese campo en la transacción.
    datosPersonales: datos?.acceptance_token ?? '',
    permalinkDatosPersonales: datos?.permalink ?? '',
  };
}

export interface DatosTransaccion {
  referencia: string;
  montoEnCentavos: number;
  correo: string;
  nombreCompleto: string;
  celular: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  tokenTarjeta: string;
  cuotas: number;
  tokenAceptacion: string;
  tokenDatosPersonales: string;
}

export interface TransaccionCreada {
  id: string;
  estado: EstadoTransaccion;
  referencia: string;
}

export async function crearTransaccion(datos: DatosTransaccion): Promise<TransaccionCreada> {
  const { llavePrivada } = entornoWompi();

  const cuerpoPeticion: Record<string, unknown> = {
    acceptance_token: datos.tokenAceptacion,
    amount_in_cents: datos.montoEnCentavos,
    currency: MONEDA,
    customer_email: datos.correo,
    reference: datos.referencia,
    signature: firmarIntegridad(datos.referencia, datos.montoEnCentavos),
    payment_method: {
      type: 'CARD',
      token: datos.tokenTarjeta,
      installments: datos.cuotas,
    },
    customer_data: {
      phone_number: `57${datos.celular}`,
      full_name: datos.nombreCompleto,
      legal_id: datos.numeroDocumento,
      legal_id_type: datos.tipoDocumento,
    },
  };

  if (datos.tokenDatosPersonales) {
    cuerpoPeticion.accept_personal_auth = datos.tokenDatosPersonales;
  }

  const respuesta = await fetch(`${wompiBaseUrl(llavePrivada)}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${llavePrivada}`,
    },
    body: JSON.stringify(cuerpoPeticion),
    cache: 'no-store',
  });

  const cuerpo = (await respuesta.json().catch(() => null)) as
    | { data?: { id?: string; status?: string; reference?: string }; error?: { reason?: unknown } }
    | null;

  if (!respuesta.ok || !cuerpo?.data?.id) {
    // El detalle real queda en el log del servidor; al navegador va un mensaje
    // genérico para no exponer estructura interna de la pasarela.
    console.error('[wompi] error creando transacción', respuesta.status, JSON.stringify(cuerpo));
    throw new Error('Wompi no aceptó la transacción.');
  }

  return {
    id: cuerpo.data.id,
    estado: (cuerpo.data.status as EstadoTransaccion) ?? 'PENDING',
    referencia: cuerpo.data.reference ?? datos.referencia,
  };
}

export interface TransaccionConsultada {
  id: string;
  estado: EstadoTransaccion;
  referencia: string;
  correo: string;
  /** Nombre que se envió en customer_data; se usa para saludar en el correo. */
  nombre: string;
  montoEnCentavos: number;
  razon: string | null;
  metodo: string | null;
}

export async function consultarTransaccion(id: string): Promise<TransaccionConsultada | null> {
  const { llavePrivada } = entornoWompi();

  const respuesta = await fetch(`${wompiBaseUrl(llavePrivada)}/transactions/${id}`, {
    headers: { Authorization: `Bearer ${llavePrivada}` },
    cache: 'no-store',
  });

  if (!respuesta.ok) return null;

  const cuerpo = (await respuesta.json().catch(() => null)) as
    | {
        data?: {
          id?: string;
          status?: string;
          reference?: string;
          customer_email?: string;
          amount_in_cents?: number;
          status_message?: string | null;
          payment_method_type?: string | null;
          customer_data?: { full_name?: string } | null;
        };
      }
    | null;

  const datos = cuerpo?.data;
  if (!datos?.id) return null;

  return {
    id: datos.id,
    estado: (datos.status as EstadoTransaccion) ?? 'PENDING',
    referencia: datos.reference ?? '',
    correo: datos.customer_email ?? '',
    nombre: datos.customer_data?.full_name ?? '',
    montoEnCentavos: datos.amount_in_cents ?? 0,
    razon: datos.status_message ?? null,
    metodo: datos.payment_method_type ?? null,
  };
}

/** Forma del evento que manda Wompi al webhook (solo lo que usamos). */
export interface EventoWompi {
  event?: string;
  sent_at?: string;
  timestamp?: number;
  signature?: {
    checksum?: string;
    properties?: string[];
  };
  data?: {
    transaction?: {
      id?: string;
      status?: string;
      reference?: string;
      amount_in_cents?: number;
      customer_email?: string;
      status_message?: string | null;
    };
  };
}

/** Lee "transaction.amount_in_cents" recorriendo el objeto por puntos. */
function leerRuta(objeto: unknown, ruta: string): unknown {
  return ruta.split('.').reduce<unknown>((actual, llave) => {
    if (actual && typeof actual === 'object' && llave in (actual as Record<string, unknown>)) {
      return (actual as Record<string, unknown>)[llave];
    }
    return undefined;
  }, objeto);
}

/**
 * Verifica el checksum del evento.
 *
 * Wompi indica en `signature.properties` QUÉ campos concatenar y en qué orden;
 * se les pega el timestamp y el secreto de eventos, y el SHA-256 debe coincidir
 * con `signature.checksum`. Leemos las propiedades del propio evento (en vez de
 * fijarlas nosotros) para que la verificación siga funcionando si Wompi agrega
 * campos a la firma.
 *
 * La comparación es en tiempo constante: comparar hashes con === filtra
 * información por el tiempo de respuesta y permitiría adivinar el checksum byte
 * a byte.
 */
export function verificarFirmaEvento(evento: EventoWompi): boolean {
  const { secretoEventos } = entornoWompi();

  const checksumRecibido = evento.signature?.checksum;
  const propiedades = evento.signature?.properties;
  const timestamp = evento.timestamp;

  if (!checksumRecibido || !Array.isArray(propiedades) || propiedades.length === 0) return false;
  if (typeof timestamp !== 'number') return false;

  let concatenado = '';
  for (const propiedad of propiedades) {
    const valor = leerRuta(evento.data, propiedad);
    if (valor === undefined || valor === null) return false;
    concatenado += String(valor);
  }

  const calculado = sha256(`${concatenado}${timestamp}${secretoEventos}`);

  const a = Buffer.from(calculado, 'utf8');
  const b = Buffer.from(checksumRecibido.toLowerCase(), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
