import Link from 'next/link';

import {
  IconoChile,
  IconoCupcake,
  IconoFlecha,
  IconoFuego,
  IconoSobre,
  IconoTomate,
} from '@/components/Icons';
import { formatCOP, PLANES, PLAN_POR_DEFECTO } from '@/lib/plans';

export function CtaFinal() {
  return (
    <section className="relative overflow-hidden bg-masa-100 py-16 sm:py-20">
      <div className="contenedor">
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-carbon-800 bg-gradient-to-br from-tomate-500 via-tomate-600 to-tomate-700 px-6 py-12 text-center shadow-plato-alta sm:px-12 sm:py-16">
          {/* Lunares blancos tenues: mantel de cocina sobre el rojo. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#fff8ec 1.8px, transparent 2px)',
              backgroundSize: '22px 22px',
            }}
          />

          <IconoTomate className="adorno left-[6%] top-[12%] h-14 w-14 animate-flotar opacity-90" />
          <IconoCupcake className="adorno right-[8%] top-[16%] h-14 w-14 animate-flotar opacity-90 [animation-delay:-2.5s]" />
          <IconoChile className="adorno bottom-[10%] left-[12%] hidden h-12 w-12 animate-flotar opacity-80 [animation-delay:-1.5s] sm:block" />

          <div className="relative mx-auto max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-carbon-800/85 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-mostaza-200">
              <IconoFuego className="h-3.5 w-3.5" />
              Empieza hoy mismo
            </p>

            <h2 className="mt-5 text-3xl font-black leading-[1.1] text-white sm:text-[2.75rem]">
              La primera receta la haces esta noche
            </h2>

            <p className="mt-4 text-lg leading-relaxed text-tomate-50">
              Pagas una vez, entras el mismo día y aprendes a tu ritmo. Sin mensualidades y sin
              letra menuda.
            </p>

            {/* Los tres precios salen de PLANES: nunca quedan desactualizados
                respecto a lo que se cobra de verdad. */}
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              {PLANES.map((plan) => (
                <li key={plan.id}>
                  <Link
                    href={`/checkout?plan=${plan.id}`}
                    className="numeros-tabulares inline-flex items-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/20"
                  >
                    {plan.nombre}
                    <span className="font-black text-mostaza-200">{formatCOP(plan.precio)}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/checkout?plan=${PLAN_POR_DEFECTO}`}
                className="boton w-full bg-carbon-800 text-white shadow-plato hover:-translate-y-0.5 hover:bg-carbon-900 sm:w-auto"
              >
                <IconoSobre className="h-4 w-4" />
                Quiero mi acceso
                <IconoFlecha className="h-4 w-4" />
              </Link>
              <Link
                href="#planes"
                className="boton w-full border-2 border-white/60 text-white hover:bg-white/10 sm:w-auto"
              >
                Comparar los planes
              </Link>
            </div>

            <p className="mt-5 text-xs font-semibold text-tomate-100">
              Pago seguro con Wompi · Recibes el acceso en tu correo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
