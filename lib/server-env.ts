/**
 * Lectura validada de variables de entorno. Solo se importa desde rutas de
 * API (servidor). Falla ruidosamente y temprano: es mejor un 500 con mensaje
 * claro en el log que una transacción a medias o un correo que nunca sale.
 */

import 'server-only';

function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor || valor.trim() === '') {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Copia .env.example a .env.local y complétala.`,
    );
  }
  return valor.trim();
}

/** Configuración de Wompi del lado servidor. */
export function entornoWompi() {
  return {
    llavePublica: requerida('NEXT_PUBLIC_WOMPI_PUBLIC_KEY'),
    llavePrivada: requerida('WOMPI_PRIVATE_KEY'),
    secretoIntegridad: requerida('WOMPI_INTEGRITY_SECRET'),
    secretoEventos: requerida('WOMPI_EVENTS_SECRET'),
  };
}

/** Configuración de correo. */
export function entornoCorreo() {
  return {
    apiKey: requerida('RESEND_API_KEY'),
    remitente: requerida('EMAIL_FROM'),
    soporte: requerida('EMAIL_SOPORTE'),
    urlAcceso: requerida('URL_ACCESO_AULA'),
  };
}

/**
 * Chequeo suave para diagnósticos: devuelve qué falta sin lanzar. Lo usa la
 * ruta de pago para responder un 500 explicativo en vez de reventar con un
 * stack trace incomprensible.
 */
export function variablesFaltantes(): string[] {
  const nombres = [
    'NEXT_PUBLIC_WOMPI_PUBLIC_KEY',
    'WOMPI_PRIVATE_KEY',
    'WOMPI_INTEGRITY_SECRET',
    'WOMPI_EVENTS_SECRET',
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'EMAIL_SOPORTE',
    'URL_ACCESO_AULA',
  ];
  return nombres.filter((nombre) => {
    const valor = process.env[nombre];
    return !valor || valor.trim() === '';
  });
}
