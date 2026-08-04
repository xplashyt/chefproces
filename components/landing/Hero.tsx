import Link from 'next/link';

import {
  AdornoEspecias,
  IconoAguacate,
  IconoChile,
  IconoCucharon,
  IconoEstrella,
  IconoFlechaAbajo,
  IconoHuevo,
  IconoLimon,
  IconoOlla,
  IconoTemporizador,
  IconoTomate,
  IconoZanahoria,
} from '@/components/Icons';
import { formatCOP, PLANES, PLAN_POR_DEFECTO } from '@/lib/plans';

/** Precio más bajo, calculado desde PLANES para que nunca quede desactualizado. */
const PRECIO_DESDE = Math.min(...PLANES.map((plan) => plan.precio));

const DATOS = [
  { valor: '8', etiqueta: 'módulos en video' },
  { valor: '120', etiqueta: 'recetas paso a paso' },
  { valor: '15', etiqueta: 'minutos por clase' },
];

/**
 * Hero. Todo el arte son SVG y gradientes: las frutas "flotan" con CSS y el
 * vapor de la olla sube con keyframes. Nada de esto pesa una petición de red ni
 * mueve el layout al cargar.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden azulejo pb-20 pt-14 sm:pt-20">
      {/* Resplandor cálido detrás del texto, como luz de cocina encendida. */}
      <div
        aria-hidden="true"
        className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-mostaza-200/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 top-32 h-[24rem] w-[24rem] rounded-full bg-tomate-200/40 blur-3xl"
      />

      {/* Widgets flotantes de cocina. Decorativos: pointer-events-none y sin
          texto alternativo (el sentido está en el titular). */}
      <IconoTomate className="adorno left-[4%] top-[16%] h-14 w-14 animate-flotar opacity-90 [animation-delay:-1s]" />
      <IconoLimon className="adorno right-[6%] top-[10%] h-12 w-12 animate-flotar opacity-90 [animation-delay:-3s]" />
      <IconoAguacate className="adorno bottom-[16%] left-[8%] h-12 w-12 animate-flotar opacity-80 [animation-delay:-2s]" />
      <IconoChile className="adorno right-[12%] top-[52%] h-11 w-11 animate-flotar opacity-80 [animation-delay:-4s]" />
      <IconoHuevo className="adorno bottom-[8%] right-[4%] hidden h-12 w-12 animate-flotar opacity-80 [animation-delay:-1.5s] sm:block" />
      <IconoZanahoria className="adorno left-[46%] top-[6%] hidden h-11 w-11 animate-flotar opacity-70 [animation-delay:-2.5s] lg:block" />
      <AdornoEspecias className="adorno -right-24 bottom-[-6rem] h-72 w-72 animate-girar-lento opacity-70" />

      <div className="contenedor relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ------------------------------------------------------- columna texto */}
          <div>
            <p className="antetitulo">
              <IconoCucharon className="h-3.5 w-3.5" />
              Membresía para mujeres que empiezan de cero
            </p>

            <h1 className="mt-5 text-[2.5rem] font-black leading-[1.05] text-carbon-800 sm:text-5xl lg:text-[3.5rem]">
              Aprende a cocinar de verdad y, si quieres,{' '}
              <span className="subrayado-marcador text-tomate-600">cobra por lo que cocinas</span>
            </h1>

            <p className="parrafo mt-6 max-w-xl text-lg">
              Sin términos raros, sin ingredientes imposibles y sin recetas de tres horas. Clases
              cortas para ver desde el celular, con lo que se consigue en la tienda del barrio.{' '}
              <span className="resaltado font-bold text-carbon-800">
                Del primer huevo bien hecho a tu primera venta.
              </span>
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="#planes" className="boton-primario text-[1.05rem]">
                Ver los planes
                <IconoFlechaAbajo className="h-4 w-4" />
              </Link>
              <Link href={`/checkout?plan=${PLAN_POR_DEFECTO}`} className="boton-secundario">
                Empezar ahora
              </Link>
            </div>

            <p className="numeros-tabulares mt-5 text-sm font-semibold text-carbon-500">
              Desde <span className="text-lg font-black text-tomate-600">{formatCOP(PRECIO_DESDE)}</span>{' '}
              COP · pago único · acceso el mismo día
            </p>

            {/* Cifras del programa, con números tabulares para que queden
                alineadas entre sí. */}
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-3">
              {DATOS.map((dato) => (
                <div
                  key={dato.etiqueta}
                  className="rounded-2xl border border-masa-200 bg-white/85 px-3 py-3.5 text-center"
                >
                  <dt className="sr-only">{dato.etiqueta}</dt>
                  <dd>
                    <span className="numeros-tabulares block text-2xl font-black text-tomate-600">
                      {dato.valor}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-bold uppercase leading-tight tracking-wide text-carbon-500">
                      {dato.etiqueta}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ------------------------------------- columna arte: tarjeta de receta */}
          <div className="relative mx-auto w-full max-w-md">
            {/* Sombra girada: da la sensación de dos hojas apiladas en la mesa. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -rotate-3 rounded-[2rem] border border-masa-300 bg-masa-200/70"
            />

            <div className="papel-receta relative rotate-1 rounded-[2rem] border-2 border-masa-300 p-6 shadow-plato-alta sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-tomate-600">
                    Módulo 1 · Clase 1
                  </p>
                  <h2 className="mt-1 text-2xl font-black leading-tight text-carbon-800">
                    Arroz que no se pega
                  </h2>
                </div>
                <span className="chip shrink-0 border-albahaca-200 bg-albahaca-50 text-albahaca-700">
                  <IconoTemporizador className="h-3.5 w-3.5" />
                  14 min
                </span>
              </div>

              {/* Olla con vapor animado: el "personaje" del hero. */}
              <div className="relative mt-6 flex items-end justify-center rounded-2xl bg-gradient-to-b from-mostaza-100 to-masa-200 px-6 pb-6 pt-12">
                <div aria-hidden="true" className="vapor-humo absolute left-1/2 top-3 flex -translate-x-1/2 gap-2.5">
                  <span className="block h-8 w-2 animate-vapor rounded-full bg-white/80" />
                  <span className="block h-10 w-2 animate-vapor rounded-full bg-white/80 [animation-delay:-1.1s]" />
                  <span className="block h-8 w-2 animate-vapor rounded-full bg-white/80 [animation-delay:-2.2s]" />
                </div>
                <IconoOlla className="h-24 w-24 text-carbon-700" />
              </div>

              <ul className="mt-6 space-y-2.5 text-[15px] text-carbon-700">
                {[
                  '1 taza de arroz, 2 de agua: la medida que nunca falla',
                  'Sofríe el ajo hasta que huela, no hasta que se dore',
                  'Tapa, baja el fuego y no destapes por 18 minutos',
                ].map((paso, indice) => (
                  <li key={paso} className="flex gap-3">
                    <span className="numeros-tabulares mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tomate-500 text-xs font-black text-white">
                      {indice + 1}
                    </span>
                    <span className="leading-snug">{paso}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center justify-between gap-2 border-t border-dashed border-masa-300 pt-4">
                <div className="flex items-center gap-1 text-mostaza-500">
                  {[0, 1, 2, 3, 4].map((estrella) => (
                    <IconoEstrella key={estrella} className="h-4 w-4" />
                  ))}
                </div>
                <p className="numeros-tabulares text-xs font-bold text-carbon-500">
                  1.842 alumnas la hicieron
                </p>
              </div>
            </div>

            {/* Sello adhesivo tipo etiqueta de frasco. */}
            <div className="absolute -bottom-5 -left-4 rotate-[-8deg] rounded-2xl border-2 border-carbon-800 bg-mostaza-300 px-4 py-2 shadow-plato">
              <p className="text-xs font-black uppercase leading-tight tracking-wide text-carbon-800">
                Sin ingredientes
                <br />
                imposibles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Borde ondulado inferior: transición hacia la sección siguiente. */}
      <div aria-hidden="true" className="onda-inferior absolute bottom-0 left-0 h-3 w-full bg-white" />
    </section>
  );
}
