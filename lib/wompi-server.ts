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
import { clasificarErrorGateway, type CodigoErrorPago } from '@/lib/payment-errors';
import { entornoWompi } from '@/lib/server-env';
import { wompiBaseUrl } from '@/lib/wompi-endpoint';

function sha256(texto: string): string {
  return createHash('sha256').update(texto, 'utf8').digest('hex');
}

/**
 * Error de una falla de la PASARELA (red caída, bloqueo por seguridad, rate
 * limiting, etc.), ya clasificada y con el mensaje final en español listo
 * para mostrar. Se distingue de un `Error` genérico para que la ruta de API
 * elija el status HTTP correcto (ver app/api/wompi/pay/route.ts).
 */
export class ErrorPasarela extends Error {
  readonly codigo: CodigoErrorPago;

  constructor(codigo: CodigoErrorPago, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorPasarela';
    this.codigo = codigo;
  }
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

  let respuesta: Response;
  try {
    respuesta = await fetch(`${wompiBaseUrl(llavePublica)}/merchants/${llavePublica}`, {
      // Sin caché: el token de aceptación caduca y uno vencido tumba el pago.
      cache: 'no-store',
    });
  } catch (fallo) {
    console.error('[wompi] no se pudo conectar para pedir los tokens de aceptación', fallo);
    const clasificado = clasificarErrorGateway({ redCaida: true });
    throw new ErrorPasarela(clasificado.codigo, `${clasificado.mensaje} ${clasificado.consejo ?? ''}`.trim());
  }

  // Texto primero, JSON después: si lo que volvió no es JSON (por ejemplo una
  // página de bloqueo de un WAF delante de la API de Wompi), `.json()`
  // lanzaría antes de poder distinguir esa causa de un simple 5xx.
  const textoCrudo = await respuesta.text().catch(() => '');
  let cuerpo: {
    data?: {
      presigned_acceptance?: { acceptance_token?: string; permalink?: string };
      presigned_personal_data_auth?: { acceptance_token?: string; permalink?: string };
    };
  } | null = null;
  try {
    cuerpo = textoCrudo ? JSON.parse(textoCrudo) : null;
  } catch {
    cuerpo = null;
  }

  if (!respuesta.ok) {
    console.error('[wompi] /merchants respondió con error', {
      httpStatus: respuesta.status,
      cuerpoCrudo: cuerpo ? undefined : textoCrudo.slice(0, 300),
    });
    const clasificado = clasificarErrorGateway({
      httpStatus: respuesta.status,
      respuestaNoJson: cuerpo === null && textoCrudo.length > 0,
    });
    throw new ErrorPasarela(clasificado.codigo, `${clasificado.mensaje} ${clasificado.consejo ?? ''}`.trim());
  }

  const aceptacion = cuerpo?.data?.presigned_acceptance;
  const datos = cuerpo?.data?.presigned_personal_data_auth;

  if (!aceptacion?.acceptance_token) {
    console.error('[wompi] respuesta de /merchants sin token de aceptación', cuerpo);
    throw new ErrorPasarela(
      'DESCONOCIDO',
      'La pasarela de pagos no está configurada correctamente. Escríbenos para completar tu compra.',
    );
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

  let respuesta: Response;
  try {
    respuesta = await fetch(`${wompiBaseUrl(llavePrivada)}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${llavePrivada}`,
      },
      body: JSON.stringify(cuerpoPeticion),
      cache: 'no-store',
    });
  } catch (fallo) {
    // El fetch nunca llegó a Wompi: DNS, timeout, sin salida a internet desde
    // el servidor... Nada de esto tiene un status HTTP que clasificar.
    console.error('[wompi] no se pudo conectar para crear la transacción', {
      referencia: datos.referencia,
      mensaje: fallo instanceof Error ? fallo.message : String(fallo),
    });
    const clasificado = clasificarErrorGateway({ redCaida: true });
    throw new ErrorPasarela(clasificado.codigo, `${clasificado.mensaje} ${clasificado.consejo ?? ''}`.trim());
  }

  // Texto primero, JSON después: un bloqueo de WAF/firewall delante de la API
  // de Wompi (IP marcada como sospechosa, por ejemplo) típicamente responde
  // con una página HTML, no con el JSON de error que se espera aquí.
  const textoCrudo = await respuesta.text().catch(() => '');
  let cuerpo: {
    data?: { id?: string; status?: string; reference?: string };
    error?: { type?: string; reason?: unknown; messages?: unknown };
  } | null = null;
  try {
    cuerpo = textoCrudo ? JSON.parse(textoCrudo) : null;
  } catch {
    cuerpo = null;
  }

  if (!respuesta.ok || !cuerpo?.data?.id) {
    // El detalle real queda en el log del servidor; al navegador nunca le
    // llega la estructura interna cruda de la pasarela.
    console.error('[wompi] error creando transacción', {
      httpStatus: respuesta.status,
      error: cuerpo?.error,
      cuerpoCrudo: cuerpo ? undefined : textoCrudo.slice(0, 300),
      referencia: datos.referencia,
    });

    // Si Wompi devolvió su formato habitual de error de VALIDACIÓN, ese
    // detalle sí describe algo corregible (un campo mal formado, por
    // ejemplo). Si no —403/429/5xx, o ni siquiera vino JSON—, el problema es
    // la pasarela o la conexión, y así se lo decimos en vez de un mensaje
    // fijo que no distingue nada.
    const mensajes = cuerpo?.error?.messages;
    const detalle =
      mensajes && typeof mensajes === 'object'
        ? Object.values(mensajes as Record<string, unknown>).flat().join(' ')
        : typeof cuerpo?.error?.reason === 'string'
          ? cuerpo.error.reason
          : '';

    if (detalle) {
      throw new Error(detalle);
    }

    const clasificado = clasificarErrorGateway({
      httpStatus: respuesta.status,
      wompiErrorType: cuerpo?.error?.type ?? null,
      respuestaNoJson: cuerpo === null && textoCrudo.length > 0,
    });
    throw new ErrorPasarela(clasificado.codigo, `${clasificado.mensaje} ${clasificado.consejo ?? ''}`.trim());
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
