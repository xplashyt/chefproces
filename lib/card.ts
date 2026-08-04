/**
 * Utilidades de tarjeta: SOLO se usan en el navegador.
 *
 * Los datos de la tarjeta no pasan nunca por nuestro servidor (van directo a
 * Wompi para tokenizar), así que validarlos aquí no es "validación de
 * seguridad": es para que la usuaria no gaste un intento con el banco por un
 * dígito mal escrito.
 */

import { soloDigitos } from '@/lib/payment-options';

export type MarcaTarjeta = 'VISA' | 'MASTERCARD' | 'AMEX' | 'DINERS' | 'DESCONOCIDA';

/**
 * Algoritmo de Luhn: detecta el 99 % de los errores de digitación (un dígito
 * cambiado o dos transpuestos) sin hablar con nadie.
 */
export function pasaLuhn(numero: string): boolean {
  const digitos = soloDigitos(numero);
  if (digitos.length < 12) return false;

  let suma = 0;
  let alternar = false;
  for (let i = digitos.length - 1; i >= 0; i -= 1) {
    let valor = Number(digitos[i]);
    if (alternar) {
      valor *= 2;
      if (valor > 9) valor -= 9;
    }
    suma += valor;
    alternar = !alternar;
  }
  return suma % 10 === 0;
}

/** Marca por prefijo (BIN). Sirve para pintar el logo y ajustar el CVC. */
export function detectarMarca(numero: string): MarcaTarjeta {
  const d = soloDigitos(numero);
  if (/^4/.test(d)) return 'VISA';
  if (/^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/.test(d)) return 'MASTERCARD';
  if (/^3[47]/.test(d)) return 'AMEX';
  if (/^3(0[0-5]|[68])/.test(d)) return 'DINERS';
  return 'DESCONOCIDA';
}

/** AMEX usa 15 dígitos y CVC de 4; el resto, 16 y 3. */
export function largoEsperado(marca: MarcaTarjeta): number {
  return marca === 'AMEX' ? 15 : marca === 'DINERS' ? 14 : 16;
}

export function largoCvc(marca: MarcaTarjeta): number {
  return marca === 'AMEX' ? 4 : 3;
}

/** Agrupa de 4 en 4 (AMEX 4-6-5) mientras la usuaria escribe. */
export function formatearNumero(valor: string): string {
  const d = soloDigitos(valor);
  const marca = detectarMarca(d);
  const grupos = marca === 'AMEX' ? [4, 6, 5] : [4, 4, 4, 4];

  const partes: string[] = [];
  let indice = 0;
  for (const largo of grupos) {
    if (indice >= d.length) break;
    partes.push(d.slice(indice, indice + largo));
    indice += largo;
  }
  if (indice < d.length) partes.push(d.slice(indice));
  return partes.join(' ');
}

/** Convierte "1229" en "12/29" a medida que se teclea. */
export function formatearVencimiento(valor: string): string {
  const d = soloDigitos(valor).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export interface Vencimiento {
  mes: string;
  /** Dos dígitos: es lo que espera la API de tokenización de Wompi. */
  anio: string;
}

export function validarNumero(valor: string): string | null {
  const d = soloDigitos(valor);
  if (!d) return 'Escribe el número de tu tarjeta.';
  const marca = detectarMarca(d);
  if (marca === 'DESCONOCIDA') return 'No reconocemos esa tarjeta. Revisa el número.';
  if (d.length !== largoEsperado(marca)) return `Ese número debe tener ${largoEsperado(marca)} dígitos.`;
  if (!pasaLuhn(d)) return 'El número no es válido. Revisa dígito por dígito.';
  return null;
}

export function validarCvc(valor: string, marca: MarcaTarjeta): string | null {
  const d = soloDigitos(valor);
  const esperado = largoCvc(marca);
  if (!d) return 'Falta el código de seguridad.';
  if (d.length !== esperado) return `El código de seguridad tiene ${esperado} dígitos.`;
  return null;
}

/**
 * Valida mes/año y devuelve las partes ya normalizadas. Compara contra el mes
 * actual (no contra el día) porque la tarjeta sirve hasta el último día del mes
 * de vencimiento.
 */
export function validarVencimiento(valor: string): { error: string | null; partes: Vencimiento | null } {
  const d = soloDigitos(valor);
  if (d.length !== 4) return { error: 'Escribe el vencimiento como MM/AA.', partes: null };

  const mes = Number(d.slice(0, 2));
  const anio = Number(d.slice(2, 4));
  if (mes < 1 || mes > 12) return { error: 'Ese mes no existe.', partes: null };

  const ahora = new Date();
  const anioActual = ahora.getFullYear() % 100;
  const mesActual = ahora.getMonth() + 1;

  const vencida = anio < anioActual || (anio === anioActual && mes < mesActual);
  if (vencida) return { error: 'Esa tarjeta ya está vencida.', partes: null };

  return {
    error: null,
    partes: { mes: d.slice(0, 2), anio: d.slice(2, 4) },
  };
}
