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
  const respuesta = await fetch(`${wompiBaseUrl(llavePublica)}/tokens/cards`, {
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

  const cuerpo = (await respuesta.json().catch(() => null)) as
    | { status?: string; data?: { id?: string; last_four?: string; brand?: string }; error?: unknown }
    | null;

  if (!respuesta.ok || !cuerpo?.data?.id) {
    // Wompi devuelve mensajes en inglés y con estructura variable; no los
    // mostramos crudos para no confundir a la usuaria.
    throw new ErrorWompi(
      'No pudimos validar la tarjeta. Revisa el número, la fecha y el código de seguridad.',
    );
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
