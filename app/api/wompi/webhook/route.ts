/**
 * POST /api/wompi/webhook
 *
 * Fuente de verdad del cobro: Wompi avisa aquí cuando la transacción cambia de
 * estado, incluso si la usuaria cerró el navegador. Es el camino que garantiza
 * la entrega del acceso.
 *
 * Reglas que se respetan aquí:
 *  1. Se verifica la firma del evento ANTES de mirar el contenido. Sin eso,
 *     cualquiera podría hacer un POST con status APPROVED y regalarse el curso.
 *  2. Se confía en el monto del evento, no en el del cliente: además de la
 *     firma, se compara contra el precio del plan que va dentro de la
 *     referencia. Si no cuadra, no se entrega nada.
 *  3. Siempre se responde 200 cuando el evento es legítimo, incluso si el
 *     correo falló: si respondemos error, Wompi reintenta el evento en bucle.
 *     El fallo del correo queda en el log y el polling del checkout sirve de
 *     segundo intento.
 */

import { NextResponse } from 'next/server';

import { entregarAcceso } from '@/lib/email';
import { buscarPlan, precioEnCentavos } from '@/lib/plans';
import { planDesdeReferencia } from '@/lib/reference';
import { verificarFirmaEvento, type EventoWompi } from '@/lib/wompi-server';

export const dynamic = 'force-dynamic';

export async function POST(peticion: Request) {
  let evento: EventoWompi;
  try {
    evento = (await peticion.json()) as EventoWompi;
  } catch {
    return NextResponse.json({ mensaje: 'Cuerpo inválido.' }, { status: 400 });
  }

  let firmaValida: boolean;
  try {
    firmaValida = verificarFirmaEvento(evento);
  } catch (fallo) {
    // Falta WOMPI_EVENTS_SECRET u otra variable: es culpa nuestra, no del
    // evento. Se responde 500 (no 401) a propósito, para que Wompi reintente
    // el evento cuando la configuración quede arreglada y no se pierda la venta.
    console.error('[webhook] no se pudo verificar la firma por configuración', fallo);
    return NextResponse.json({ mensaje: 'Webhook mal configurado.' }, { status: 500 });
  }

  if (!firmaValida) {
    // 401 y ni una palabra más: no se le dice al atacante qué falló.
    console.warn('[webhook] firma inválida, evento descartado');
    return NextResponse.json({ mensaje: 'Firma inválida.' }, { status: 401 });
  }

  const transaccion = evento.data?.transaction;
  if (!transaccion?.id) {
    return NextResponse.json({ recibido: true, nota: 'Evento sin transacción.' });
  }

  // Solo interesa el estado aprobado; los demás se registran y se aceptan para
  // que Wompi no reintente.
  if (transaccion.status !== 'APPROVED') {
    console.info(
      `[webhook] ${transaccion.id} en estado ${transaccion.status ?? 'desconocido'}: no se entrega acceso`,
    );
    return NextResponse.json({ recibido: true });
  }

  const planId = planDesdeReferencia(transaccion.reference);
  const plan = buscarPlan(planId);
  if (!plan) {
    console.error('[webhook] referencia sin plan reconocible:', transaccion.reference);
    return NextResponse.json({ recibido: true, nota: 'Referencia desconocida.' });
  }

  // Verificación de monto: el evento va firmado, pero comparar contra el precio
  // real cierra cualquier hueco de configuración (por ejemplo, un link de pago
  // viejo con otro valor).
  if (transaccion.amount_in_cents !== precioEnCentavos(plan)) {
    console.error(
      `[webhook] monto inesperado para ${plan.id}: llegó ${transaccion.amount_in_cents}, se esperaba ${precioEnCentavos(plan)}`,
    );
    return NextResponse.json({ recibido: true, nota: 'Monto no coincide.' });
  }

  const correo = transaccion.customer_email;
  if (!correo) {
    console.error('[webhook] transacción aprobada sin correo:', transaccion.id);
    return NextResponse.json({ recibido: true, nota: 'Sin correo del cliente.' });
  }

  const resultado = await entregarAcceso({
    transaccionId: transaccion.id,
    referencia: transaccion.reference ?? '',
    correo,
    nombre: correo,
    plan,
  });

  console.info(`[webhook] ${transaccion.id} → entrega: ${resultado}`);

  // 200 siempre: ver regla 3 arriba.
  return NextResponse.json({ recibido: true, entrega: resultado });
}
