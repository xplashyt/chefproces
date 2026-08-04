import type { Metadata } from 'next';
import Link from 'next/link';

import { PanelCheckout } from '@/components/checkout/PanelCheckout';
import { IconoCandado, IconoEscudo, Logo } from '@/components/Icons';
import { planOPorDefecto } from '@/lib/plans';

export const metadata: Metadata = {
  title: 'Inscripción',
  description: 'Completa tu inscripción a la membresía de cocina Sazón Propio. Pago seguro con Wompi.',
  // El checkout no debe aparecer en Google: no es una página de contenido y
  // puede quedar indexada con un plan que ya no exista.
  robots: { index: false, follow: false },
};

/**
 * Página de checkout: componente de SERVIDOR.
 *
 * El `?plan=` se lee y se valida acá, no en el navegador. Así el panel recibe un
 * plan real de lib/plans.ts (con su precio de verdad) y nunca un valor arbitrario
 * de la URL. Aunque alguien escriba ?plan=gratis, el servidor cae al plan por
 * defecto y el monto que se cobra siempre lo pone la API con el precio de la
 * tabla, no la URL.
 */
export default function PaginaCheckout({
  searchParams,
}: {
  searchParams: { plan?: string | string[] };
}) {
  // Si el parámetro llega repetido (?plan=a&plan=b) Next entrega un arreglo:
  // se toma el primero y se valida igual.
  const parametro = Array.isArray(searchParams.plan) ? searchParams.plan[0] : searchParams.plan;
  const plan = planOPorDefecto(parametro);

  return (
    <div className="min-h-screen bg-masa-100">
      {/* Encabezado mínimo: en checkout, cada enlace extra es una salida. Solo
          queda el logo (volver al inicio) y el sello de pago seguro. */}
      <header className="border-b border-masa-200 bg-white">
        <div className="contenedor flex items-center justify-between gap-4 py-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Sazón Propio, inicio">
            <Logo className="h-10 w-10" />
            <span className="text-base font-black text-carbon-800 sm:text-lg">Sazón Propio</span>
          </Link>
          <p className="flex items-center gap-2 text-xs font-bold text-albahaca-700">
            <IconoCandado className="h-4 w-4" />
            <span className="hidden sm:inline">Pago seguro ·</span> Wompi
          </p>
        </div>
      </header>

      <main id="contenido" className="contenedor py-10 sm:py-14">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="antetitulo">
            <IconoEscudo className="h-3.5 w-3.5" />
            Último paso
          </p>
          <h1 className="titulo-seccion mt-4">Completa tu inscripción</h1>
          <p className="parrafo mt-3">
            Llena tus datos, paga con tarjeta y recibe el acceso en tu correo el mismo día.
          </p>
        </div>

        <PanelCheckout plan={plan} />
      </main>

      <footer className="contenedor pb-12 pt-4">
        <p className="text-center text-xs leading-relaxed text-carbon-400">
          Los pagos son procesados por Wompi S.A.S. Los datos de tu tarjeta viajan cifrados
          directamente a la pasarela: este sitio no los recibe ni los almacena. Precios en pesos
          colombianos (COP).
        </p>
      </footer>
    </div>
  );
}
