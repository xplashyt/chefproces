/**
 * GET /api/wompi/status/:id
 *
 * Consulta el estado de la transacción. La usa el polling del checkout: con
 * tarjeta, Wompi responde PENDING y resuelve segundos después (a veces con 3-D
 * Secure de por medio), así que el navegador pregunta cada pocos segundos.
 *
 * Además ENTREGA EL ACCESO si ve APPROVED. ¿Por qué aquí también, si existe el
 * webhook? Porque en desarrollo (localhost) Wompi no puede alcanzar el webhook,
 * y en producción un webhook puede demorarse o perderse. La entrega es
 * idempotente (ver lib/email.ts), así que hacerlo por los dos caminos no
 * duplica correos en el caso normal.
 */

import { NextResponse } from 'next/server';

import { entregarAcceso } from '@/lib/email';
import { mensajeEstado } from '@/lib/payment-options';
import { buscarPlan } from '@/lib/plans';
import { planDesdeReferencia } from '@/lib/reference';
import { consultarTransaccion } from '@/lib/wompi-server';

export const dynamic = 'force-dynamic';

export async function GET(_peticion: Request, { params }: { params: { id: string } }) {
  const id = params.id?.trim();
  if (!id) {
    return NextResponse.json({ mensaje: 'Falta el id de la transacción.' }, { status: 400 });
  }

  try {
    const transaccion = await consultarTransaccion(id);
    if (!transaccion) {
      return NextResponse.json({ mensaje: 'No encontramos esa transacción.' }, { status: 404 });
    }

    if (transaccion.estado === 'APPROVED') {
      const planId = planDesdeReferencia(transaccion.referencia);
      const plan = buscarPlan(planId);
      if (plan && transaccion.correo) {
        await entregarAcceso({
          transaccionId: transaccion.id,
          referencia: transaccion.referencia,
          correo: transaccion.correo,
          // Si Wompi no devuelve el nombre, se usa el correo: el saludo queda
          // menos bonito pero el acceso igual llega.
          nombre: transaccion.nombre || transaccion.correo,
          plan,
        });
      }
    }

    return NextResponse.json(
      {
        id: transaccion.id,
        estado: transaccion.estado,
        referencia: transaccion.referencia,
        correo: transaccion.correo,
        mensaje: mensajeEstado(transaccion.estado, transaccion.razon),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[status] fallo consultando la transacción', error);
    return NextResponse.json(
      { mensaje: 'No pudimos consultar el estado del pago. Reintentamos en unos segundos.' },
      { status: 502 },
    );
  }
}
