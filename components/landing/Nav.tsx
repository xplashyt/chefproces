import Link from 'next/link';

import { IconoFlecha, IconoFuego, IconoSobre, Logo } from '@/components/Icons';
import { PLAN_POR_DEFECTO } from '@/lib/plans';

const ENLACES = [
  { href: '#incluye', texto: 'Qué incluye' },
  { href: '#temario', texto: 'Temario' },
  { href: '#planes', texto: 'Planes' },
  { href: '#preguntas', texto: 'Preguntas' },
];

/**
 * Barra de navegación. Es un componente de SERVIDOR: llega como HTML, sin
 * hidratación.
 *
 * El menú móvil se hace con <details>/<summary> en vez de un botón con estado:
 * el navegador ya sabe abrir y cerrar, responde a teclado y a lector de
 * pantalla, y cuesta 0 KB de JavaScript. Un menú "moderno" con useState
 * obligaría a volver cliente toda la barra.
 */
export function Nav() {
  return (
    <header className="sticky top-0 z-50">
      {/* Cinta superior: tres promesas cortas. En móvil solo cabe la primera. */}
      <div className="bg-carbon-800 text-center text-[13px] text-masa-200">
        <div className="contenedor flex items-center justify-center gap-2 py-2">
          <IconoFuego className="h-4 w-4 shrink-0" />
          <p className="font-semibold">
            Pago único, sin mensualidades
            <span className="hidden sm:inline"> · Acceso inmediato por correo · Soporte por WhatsApp</span>
          </p>
        </div>
      </div>

      <div className="border-b border-masa-200 bg-masa-100/95 backdrop-blur-sm">
        <div className="contenedor flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Sazón Propio, inicio">
            <Logo className="h-11 w-11 shrink-0" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight text-carbon-800">Sazón Propio</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-tomate-600">
                Cocina desde cero
              </span>
            </span>
          </Link>

          <nav aria-label="Secciones del sitio" className="hidden items-center gap-1 md:flex">
            {ENLACES.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                className="rounded-full px-3.5 py-2 text-sm font-bold text-carbon-600 transition-colors hover:bg-white hover:text-tomate-600"
              >
                {enlace.texto}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={`/checkout?plan=${PLAN_POR_DEFECTO}`}
              className="boton-primario hidden px-5 py-2.5 text-sm sm:inline-flex"
            >
              Inscribirme
              <IconoFlecha className="h-4 w-4" />
            </Link>

            {/* Menú móvil sin JavaScript. `group` permite girar la flecha con
                CSS cuando <details> está abierto. */}
            <details className="group relative md:hidden">
              <summary className="boton-secundario cursor-pointer list-none px-4 py-2.5 text-sm [&::-webkit-details-marker]:hidden">
                Menú
              </summary>
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-masa-200 bg-white p-2 shadow-plato-alta">
                <nav aria-label="Secciones del sitio" className="flex flex-col">
                  {ENLACES.map((enlace) => (
                    <a
                      key={enlace.href}
                      href={enlace.href}
                      className="rounded-xl px-3.5 py-2.5 text-sm font-bold text-carbon-700 hover:bg-masa-100"
                    >
                      {enlace.texto}
                    </a>
                  ))}
                  <Link
                    href={`/checkout?plan=${PLAN_POR_DEFECTO}`}
                    className="boton-primario mt-1.5 w-full py-2.5 text-sm"
                  >
                    <IconoSobre className="h-4 w-4" />
                    Inscribirme
                  </Link>
                </nav>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
