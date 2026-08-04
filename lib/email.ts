/**
 * Los dos correos del sistema, con Resend:
 *   1) el de bienvenida con el acceso, para la alumna;
 *   2) el aviso interno de venta, para el equipo.
 *
 * El HTML lleva estilos EN LÍNEA a propósito: Gmail y Outlook borran las hojas
 * de estilo y muchas etiquetas modernas, así que aquí no aplica nada del diseño
 * del sitio. Cada correo también va con versión de texto plano para no caer en
 * spam por ser "solo HTML".
 */

import 'server-only';
import { Resend } from 'resend';

import { formatCOP, type Plan } from '@/lib/plans';
import { entornoCorreo } from '@/lib/server-env';

/** Datos mínimos para entregar el acceso. */
export interface DatosEntrega {
  transaccionId: string;
  referencia: string;
  correo: string;
  nombre: string;
  plan: Plan;
}

/**
 * Memoria de entregas ya hechas, en RAM.
 *
 * Sin base de datos no hay forma perfecta de garantizar idempotencia, y aquí
 * hacen falta dos capas de protección porque el acceso se puede disparar dos
 * veces: por el webhook de Wompi (que reintenta) y por el polling del checkout.
 * Este Set cubre el caso normal (mismo proceso, minutos de diferencia). Si el
 * servidor se reinicia o hay varias instancias, en el peor caso la alumna
 * recibe el correo dos veces: molesto, pero preferible a que no lo reciba.
 */
const entregasHechas = new Set<string>();

/** Evita que el Set crezca sin límite en un proceso de larga vida. */
function recordarEntrega(transaccionId: string): void {
  if (entregasHechas.size > 5000) entregasHechas.clear();
  entregasHechas.add(transaccionId);
}

export function yaSeEntrego(transaccionId: string): boolean {
  return entregasHechas.has(transaccionId);
}

function cliente(): Resend {
  return new Resend(entornoCorreo().apiKey);
}

function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Primer nombre, para que el saludo no sea "Hola María Fernanda Gómez Ríos". */
function primerNombre(nombreCompleto: string): string {
  const primero = nombreCompleto.trim().split(/\s+/)[0] ?? '';
  return primero.charAt(0).toUpperCase() + primero.slice(1).toLowerCase();
}

function plantillaBienvenida(datos: DatosEntrega, urlAcceso: string): string {
  const beneficios = datos.plan.beneficios
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;vertical-align:top;color:#b52a1c;font-weight:700;">&#8226;</td><td style="padding:6px 0 6px 10px;color:#342b28;font-size:15px;line-height:1.55;">${escapar(item)}</td></tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="es-CO">
<body style="margin:0;padding:0;background:#fff8ec;">
  <div style="display:none;max-height:0;overflow:hidden;">Tu acceso al plan ${escapar(datos.plan.nombre)} ya está listo.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff8ec;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #fbeed8;">
        <tr>
          <td style="background:#b52a1c;padding:26px 30px;">
            <p style="margin:0;color:#ffdd84;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Sazón Propio</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:25px;line-height:1.25;font-family:-apple-system,'Segoe UI',Arial,sans-serif;">¡Bienvenida a la cocina, ${escapar(primerNombre(datos.nombre))}!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 30px 8px;font-family:-apple-system,'Segoe UI',Arial,sans-serif;">
            <p style="margin:0 0 16px;color:#342b28;font-size:16px;line-height:1.6;">Tu pago quedó aprobado y ya tienes acceso al <strong>plan ${escapar(datos.plan.nombre)}</strong>. Empieza por el Módulo 1: en 40 minutos vas a manejar el cuchillo sin miedo.</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 22px;">
              <tr><td style="background:#d93a28;border-radius:999px;">
                <a href="${escapar(urlAcceso)}" style="display:inline-block;padding:14px 30px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;font-family:-apple-system,'Segoe UI',Arial,sans-serif;">Entrar a mis clases &rarr;</a>
              </td></tr>
            </table>
            <p style="margin:0 0 10px;color:#5d4f4a;font-size:13px;">Si el botón no abre, copia este enlace:<br><span style="color:#b52a1c;word-break:break-all;">${escapar(urlAcceso)}</span></p>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 30px 4px;">
            <div style="background:#fff8ec;border-radius:16px;padding:18px 20px;border:1px solid #fbeed8;">
              <p style="margin:0 0 8px;color:#7f520a;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;font-family:-apple-system,'Segoe UI',Arial,sans-serif;">Lo que acabas de desbloquear</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="font-family:-apple-system,'Segoe UI',Arial,sans-serif;">${beneficios}</table>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 30px 4px;font-family:-apple-system,'Segoe UI',Arial,sans-serif;">
            <p style="margin:0 0 8px;color:#7f520a;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">Tu compra</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#342b28;font-variant-numeric:tabular-nums;">
              <tr><td style="padding:5px 0;color:#5d4f4a;">Plan</td><td align="right" style="padding:5px 0;font-weight:600;">${escapar(datos.plan.nombre)}</td></tr>
              <tr><td style="padding:5px 0;color:#5d4f4a;">Valor pagado</td><td align="right" style="padding:5px 0;font-weight:600;">${formatCOP(datos.plan.precio)} COP</td></tr>
              <tr><td style="padding:5px 0;color:#5d4f4a;">Referencia</td><td align="right" style="padding:5px 0;font-family:monospace;font-size:12px;">${escapar(datos.referencia)}</td></tr>
              <tr><td style="padding:5px 0;color:#5d4f4a;">Transacción</td><td align="right" style="padding:5px 0;font-family:monospace;font-size:12px;">${escapar(datos.transaccionId)}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 30px 30px;font-family:-apple-system,'Segoe UI',Arial,sans-serif;">
            <p style="margin:0;color:#5d4f4a;font-size:14px;line-height:1.6;">¿Algo no abre o tienes una duda? Responde este mismo correo y te contestamos. Guárdalo: es tu comprobante.</p>
          </td>
        </tr>
      </table>
      <p style="max-width:600px;margin:16px auto 0;color:#946743;font-size:12px;line-height:1.6;font-family:-apple-system,'Segoe UI',Arial,sans-serif;">Recibes este correo porque compraste la membresía Sazón Propio. Pago procesado por Wompi.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function textoBienvenida(datos: DatosEntrega, urlAcceso: string): string {
  return [
    `¡Bienvenida a la cocina, ${primerNombre(datos.nombre)}!`,
    '',
    `Tu pago quedó aprobado y ya tienes acceso al plan ${datos.plan.nombre}.`,
    '',
    `Entra aquí: ${urlAcceso}`,
    '',
    `Plan: ${datos.plan.nombre}`,
    `Valor pagado: ${formatCOP(datos.plan.precio)} COP`,
    `Referencia: ${datos.referencia}`,
    `Transacción: ${datos.transaccionId}`,
    '',
    'Responde este correo si necesitas ayuda. Guárdalo como comprobante.',
    'Sazón Propio · Pago procesado por Wompi',
  ].join('\n');
}

function plantillaAviso(datos: DatosEntrega): string {
  return `<!doctype html>
<html lang="es-CO">
<body style="margin:0;background:#f6f4f3;font-family:-apple-system,'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;border:1px solid #e7e2e0;">
        <tr><td style="padding:22px 24px 6px;">
          <h1 style="margin:0;font-size:19px;color:#1f6f40;">Venta aprobada · ${escapar(datos.plan.nombre)}</h1>
          <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#241d1b;font-variant-numeric:tabular-nums;">${formatCOP(datos.plan.precio)} COP</p>
        </td></tr>
        <tr><td style="padding:14px 24px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#342b28;">
            <tr><td style="padding:5px 0;color:#5d4f4a;">Alumna</td><td align="right" style="padding:5px 0;font-weight:600;">${escapar(datos.nombre)}</td></tr>
            <tr><td style="padding:5px 0;color:#5d4f4a;">Correo</td><td align="right" style="padding:5px 0;">${escapar(datos.correo)}</td></tr>
            <tr><td style="padding:5px 0;color:#5d4f4a;">Referencia</td><td align="right" style="padding:5px 0;font-family:monospace;font-size:12px;">${escapar(datos.referencia)}</td></tr>
            <tr><td style="padding:5px 0;color:#5d4f4a;">Transacción</td><td align="right" style="padding:5px 0;font-family:monospace;font-size:12px;">${escapar(datos.transaccionId)}</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Entrega el acceso: manda los dos correos una sola vez por transacción.
 *
 * Devuelve 'duplicado' si ya se había entregado (el webhook y el polling
 * compiten por hacerlo) y 'error' si Resend falló, para que quien llame lo
 * registre sin tumbar la respuesta HTTP: a Wompi hay que contestarle 200 o
 * seguirá reintentando el evento indefinidamente.
 */
export async function entregarAcceso(
  datos: DatosEntrega,
): Promise<'enviado' | 'duplicado' | 'error'> {
  if (yaSeEntrego(datos.transaccionId)) return 'duplicado';

  // Se marca ANTES de enviar: si dos peticiones entran casi simultáneas
  // (webhook + polling), la segunda ve la marca y no duplica el correo.
  recordarEntrega(datos.transaccionId);

  const { remitente, soporte, urlAcceso } = entornoCorreo();
  const resend = cliente();

  try {
    const bienvenida = await resend.emails.send({
      from: remitente,
      to: datos.correo,
      subject: `Ya estás dentro: plan ${datos.plan.nombre} 🍳`,
      html: plantillaBienvenida(datos, urlAcceso),
      text: textoBienvenida(datos, urlAcceso),
      replyTo: soporte,
    });

    if (bienvenida.error) {
      // Si el correo de la alumna no salió, se quita la marca para que un
      // reintento del webhook tenga otra oportunidad de entregar el acceso.
      entregasHechas.delete(datos.transaccionId);
      console.error('[resend] falló el correo de bienvenida', bienvenida.error);
      return 'error';
    }

    // El aviso interno se manda después y su fallo no revierte la entrega:
    // lo importante ya llegó a la alumna.
    const aviso = await resend.emails.send({
      from: remitente,
      to: soporte,
      subject: `💰 Venta ${datos.plan.nombre} · ${formatCOP(datos.plan.precio)} · ${datos.nombre}`,
      html: plantillaAviso(datos),
      text: `Venta aprobada\nPlan: ${datos.plan.nombre}\nValor: ${formatCOP(datos.plan.precio)} COP\nAlumna: ${datos.nombre}\nCorreo: ${datos.correo}\nReferencia: ${datos.referencia}\nTransacción: ${datos.transaccionId}`,
    });

    if (aviso.error) console.error('[resend] falló el aviso interno', aviso.error);

    return 'enviado';
  } catch (error) {
    entregasHechas.delete(datos.transaccionId);
    console.error('[resend] excepción enviando correos', error);
    return 'error';
  }
}
