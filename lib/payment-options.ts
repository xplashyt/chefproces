/**
 * Opciones y validadores compartidos entre el formulario (navegador) y la ruta
 * de pago (servidor).
 *
 * Están en un archivo común para que la validación sea LA MISMA en los dos
 * lados: el cliente valida para dar buenos mensajes, el servidor valida porque
 * nunca puede confiar en el cliente. Duplicar estas reglas es la forma más
 * fácil de que se desincronicen.
 */

/** Cuotas que acepta el formulario. Wompi permite 1..36 según franquicia. */
export const CUOTAS_DISPONIBLES = [1, 2, 3, 6, 9, 12, 18, 24, 36] as const;
export type Cuotas = (typeof CUOTAS_DISPONIBLES)[number];

export function esCuotaValida(valor: unknown): valor is Cuotas {
  const numero = typeof valor === 'string' ? Number.parseInt(valor, 10) : valor;
  return (
    typeof numero === 'number' &&
    Number.isInteger(numero) &&
    (CUOTAS_DISPONIBLES as readonly number[]).includes(numero)
  );
}

/** Deja solo dígitos: los usuarios pegan espacios, puntos y guiones. */
export function soloDigitos(valor: string): string {
  return valor.replace(/\D+/g, '');
}

export function limpiarEspacios(valor: string): string {
  return valor.replace(/\s+/g, ' ').trim();
}

/**
 * Validación de correo pragmática: algo@algo.algo. No usamos la RFC completa
 * porque rechazar correos válidos cuesta ventas y aceptar uno raro no rompe
 * nada (Resend rebota y queda en el log).
 */
export function validarCorreo(valor: string): string | null {
  const correo = valor.trim();
  if (!correo) return 'Escribe tu correo: ahí te llega el acceso.';
  if (correo.length > 180) return 'Ese correo es demasiado largo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return 'Revisa el correo, parece incompleto.';
  return null;
}

export function validarNombre(valor: string): string | null {
  const nombre = limpiarEspacios(valor);
  if (!nombre) return 'Escribe tu nombre completo.';
  if (nombre.length < 5) return 'Escribe nombre y apellido.';
  if (!nombre.includes(' ')) return 'Falta el apellido.';
  if (nombre.length > 120) return 'Ese nombre es demasiado largo.';
  return null;
}

/** Celular colombiano: 10 dígitos empezando en 3. */
export function validarCelular(valor: string): string | null {
  const digitos = soloDigitos(valor);
  if (!digitos) return 'Escribe tu celular para avisarte por WhatsApp.';
  if (digitos.length !== 10 || !digitos.startsWith('3')) {
    return 'El celular son 10 dígitos y empieza por 3.';
  }
  return null;
}

/** Cédula: entre 6 y 12 dígitos cubre CC, CE y NIT de persona natural. */
export function validarDocumento(valor: string): string | null {
  const digitos = soloDigitos(valor);
  if (!digitos) return 'Escribe el número de tu documento.';
  if (digitos.length < 6 || digitos.length > 12) return 'El documento tiene entre 6 y 12 dígitos.';
  return null;
}

export const TIPOS_DOCUMENTO = [
  { valor: 'CC', etiqueta: 'Cédula de ciudadanía' },
  { valor: 'CE', etiqueta: 'Cédula de extranjería' },
  { valor: 'NIT', etiqueta: 'NIT' },
  { valor: 'PP', etiqueta: 'Pasaporte' },
] as const;

export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number]['valor'];

export function esTipoDocumento(valor: unknown): valor is TipoDocumento {
  return (
    typeof valor === 'string' && TIPOS_DOCUMENTO.some((tipo) => tipo.valor === valor)
  );
}

/** Estados posibles de una transacción en Wompi. */
export type EstadoTransaccion = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';

export function esEstadoFinal(estado: string): boolean {
  return estado !== 'PENDING';
}

/** Mensajes en español para cada estado; el de Wompi llega en inglés. */
export function mensajeEstado(estado: string, razon?: string | null): string {
  switch (estado) {
    case 'APPROVED':
      return '¡Pago aprobado! Revisa tu correo, ya te enviamos el acceso.';
    case 'PENDING':
      return 'Estamos confirmando el pago con tu banco. No cierres esta página.';
    case 'DECLINED':
      return razon
        ? `Tu banco rechazó el pago: ${razon}. Intenta con otra tarjeta.`
        : 'Tu banco rechazó el pago. Intenta con otra tarjeta o escríbenos.';
    case 'VOIDED':
      return 'La transacción fue anulada. No se te cobró nada.';
    case 'ERROR':
      return razon
        ? `Hubo un error procesando el pago: ${razon}`
        : 'Hubo un error procesando el pago. No se te cobró; intenta de nuevo.';
    default:
      return 'Estado desconocido. Escríbenos y lo revisamos contigo.';
  }
}
