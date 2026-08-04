import Link from 'next/link';

import { IconoSobre, IconoWhatsapp, Logo } from '@/components/Icons';
import { PLANES } from '@/lib/plans';

/**
 * Año calculado en el servidor. Al ser componente de servidor no hay riesgo de
 * desajuste de hidratación entre el año del servidor y el del navegador.
 */
const ANIO = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="madera relative text-masa-200">
      <div className="contenedor py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* ------------------------------------------------------------ marca */}
          <div>
            <div className="flex items-center gap-2.5">
              <Logo className="h-11 w-11" />
              <span className="text-lg font-black text-white">Sazón Propio</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-masa-300">
              Membresía de cocina para mujeres que empiezan de cero. Técnica sencilla, recetas con
              ingredientes de acá y las herramientas para cobrar por lo que cocinas.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href="mailto:hola@sazonpropio.co"
                className="inline-flex items-center gap-2 rounded-full border border-masa-500/40 bg-white/5 px-3.5 py-2 text-xs font-bold text-masa-100 transition-colors hover:bg-white/10"
              >
                <IconoSobre className="h-4 w-4" />
                hola@sazonpropio.co
              </a>
              <a
                href="https://wa.me/573000000000"
                className="inline-flex items-center gap-2 rounded-full border border-masa-500/40 bg-white/5 px-3.5 py-2 text-xs font-bold text-masa-100 transition-colors hover:bg-white/10"
              >
                <IconoWhatsapp className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* ------------------------------------------------------- navegación */}
          <nav aria-label="Enlaces del sitio">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-mostaza-300">
              El programa
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: '/#incluye', texto: 'Qué incluye' },
                { href: '/#temario', texto: 'Temario' },
                { href: '/#planes', texto: 'Planes y precios' },
                { href: '/#preguntas', texto: 'Preguntas frecuentes' },
              ].map((enlace) => (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    className="text-masa-300 transition-colors hover:text-white"
                  >
                    {enlace.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ------------------------------------------------------------ planes */}
          <nav aria-label="Inscripción por plan">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-mostaza-300">
              Inscribirme
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {PLANES.map((plan) => (
                <li key={plan.id}>
                  <Link
                    href={`/checkout?plan=${plan.id}`}
                    className="text-masa-300 transition-colors hover:text-white"
                  >
                    Plan {plan.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ------------------------------------------------------------- legal */}
        <div className="mt-12 flex flex-col gap-4 border-t border-masa-500/30 pt-6 text-xs text-masa-400 sm:flex-row sm:items-center sm:justify-between">
          <p className="numeros-tabulares">
            © {ANIO} Sazón Propio. Todos los derechos reservados.
          </p>
          <p>
            Pagos procesados por Wompi S.A.S. · Precios en pesos colombianos (COP), IVA incluido
            cuando aplique.
          </p>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-masa-500">
          Los resultados de venta dependen de cada persona, su dedicación y su mercado: este
          programa entrega formación y herramientas, no garantiza ingresos.
        </p>
      </div>
    </footer>
  );
}
