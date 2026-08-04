/**
 * Referencia de pago: el único hilo que conecta una transacción de Wompi con
 * el plan comprado. Como NO hay base de datos, la referencia tiene que cargar
 * ella misma la información mínima para poder entregar el acceso cuando llega
 * el webhook.
 *
 * Este archivo es isomorfo (sirve en servidor y navegador): solo usa String,
 * Math y Date, nada de node:crypto.
 */

import { esPlanId, type PlanId } from '@/lib/plans';

/** Prefijo humano: al ver el extracto de Wompi se entiende de dónde viene. */
const PREFIJO = 'sazon-propio';

const SEPARADOR = '-';

export interface ReferenciaPartes {
  planId: PlanId;
  /** Momento de creación en milisegundos (para auditar a mano si hace falta). */
  creadaEn: number;
  /** Sufijo aleatorio: evita colisiones si dos personas pagan el mismo ms. */
  aleatorio: string;
}

/**
 * Construye algo como: sazon-propio-basico-lz4k9x1-h7f2qa
 * (prefijo · plan · marca de tiempo en base36 · aleatorio en base36)
 */
export function construirReferencia(planId: PlanId): string {
  const marca = Date.now().toString(36);
  const aleatorio = Math.random().toString(36).slice(2, 8).padEnd(6, '0');
  return [PREFIJO, planId, marca, aleatorio].join(SEPARADOR);
}

/**
 * Lee la referencia DESDE LA DERECHA.
 *
 * ¿Por qué desde la derecha? Porque el prefijo puede contener guiones (hoy es
 * "sazon-propio", mañana puede ser "sazon-propio-black-friday") y los ids de
 * plan también podrían llevarlos. Los tres últimos segmentos siempre son, en
 * orden fijo: plan, marca de tiempo y aleatorio. Parseando desde el final el
 * formato queda a prueba de cambios en el prefijo, sin migraciones.
 */
export function parsearReferencia(referencia: unknown): ReferenciaPartes | null {
  if (typeof referencia !== 'string') return null;

  const partes = referencia.trim().split(SEPARADOR);
  if (partes.length < 4) return null;

  const aleatorio = partes[partes.length - 1];
  const marca = partes[partes.length - 2];
  const planId = partes[partes.length - 3];

  if (!aleatorio || !marca || !planId) return null;
  if (!esPlanId(planId)) return null;

  const creadaEn = Number.parseInt(marca, 36);
  if (!Number.isFinite(creadaEn)) return null;

  return { planId, creadaEn, aleatorio };
}

/** Atajo usado por el webhook: de la referencia al plan, o null. */
export function planDesdeReferencia(referencia: unknown): PlanId | null {
  return parsearReferencia(referencia)?.planId ?? null;
}
