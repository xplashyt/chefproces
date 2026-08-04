import Link from 'next/link';

import {
  IconoCheck,
  IconoCruz,
  IconoEscudo,
  IconoFlecha,
  IconoGorroChef,
  IconoTarjeta,
} from '@/components/Icons';
import { formatCOP, PLANES } from '@/lib/plans';

/**
 * Filas de la tabla comparativa. Se escriben aquí (y no dentro de cada plan)
 * porque la comparación es una vista distinta de los mismos datos: lo que
 * importa es qué plan cubre cada fila.
 */
const COMPARACION: { fila: string; esencial: string | boolean; basico: string | boolean; avanzado: string | boolean }[] =
  [
    { fila: 'Módulos incluidos', esencial: '2 de 8', basico: '6 de 8', avanzado: '8 de 8' },
    { fila: 'Recetas paso a paso', esencial: '30', basico: '120', avanzado: '120' },
    { fila: 'Videos en vertical para el celular', esencial: true, basico: true, avanzado: true },
    { fila: 'Lista de mercado por receta', esencial: true, basico: true, avanzado: true },
    { fila: 'Postres y panadería', esencial: false, basico: true, avanzado: true },
    { fila: 'Comunidad de alumnas', esencial: false, basico: true, avanzado: true },
    { fila: 'Plantilla de costos', esencial: false, basico: true, avanzado: true },
    { fila: 'Módulo de precios y cómo cobrar', esencial: false, basico: false, avanzado: true },
    { fila: 'Fotos y ventas por WhatsApp', esencial: false, basico: false, avanzado: true },
    { fila: 'Revisión escrita de tus platos', esencial: false, basico: false, avanzado: '3 platos' },
    { fila: 'Tiempo de acceso', esencial: '6 meses', basico: '12 meses', avanzado: 'De por vida' },
  ];

/** Celda de la tabla: sí/no como icono con texto para lector de pantalla. */
function Celda({ valor }: { valor: string | boolean }) {
  if (typeof valor === 'string') {
    return <span className="numeros-tabulares text-sm font-bold text-carbon-700">{valor}</span>;
  }
  return valor ? (
    <span className="inline-flex items-center justify-center text-albahaca-600">
      <IconoCheck className="h-4 w-4" />
      <span className="sr-only">Sí incluido</span>
    </span>
  ) : (
    <span className="inline-flex items-center justify-center text-carbon-300">
      <IconoCruz className="h-3.5 w-3.5" />
      <span className="sr-only">No incluido</span>
    </span>
  );
}

export function Planes() {
  return (
    <section id="planes" className="seccion relative overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-mostaza-100/70 blur-3xl"
      />

      <div className="contenedor relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="antetitulo">
            <IconoGorroChef className="h-3.5 w-3.5" />
            Elige tu plan
          </p>
          <h2 className="titulo-seccion mt-4">Un solo pago. Sin mensualidades ni renovaciones</h2>
          <p className="parrafo mt-4">
            Los tres planes abren de inmediato. Si empiezas con el Esencial y luego quieres más,
            escríbenos y pagas solo la diferencia.
          </p>
        </div>

        {/* items-start (no items-stretch) para que la tarjeta destacada pueda
            sobresalir sin estirar a las otras. */}
        <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {PLANES.map((plan) => {
            const destacado = plan.destacado;
            return (
              <article
                key={plan.id}
                className={`relative flex h-full flex-col overflow-hidden rounded-[2rem] border-2 p-6 sm:p-7 ${
                  destacado
                    ? 'border-carbon-800 bg-carbon-800 text-masa-100 shadow-plato-alta lg:-mt-4 lg:pb-9'
                    : 'border-masa-200 bg-masa-50 shadow-plato'
                }`}
              >
                {destacado && (
                  <div className="cinta" aria-hidden="true">
                    <span>El más elegido</span>
                  </div>
                )}

                <h3
                  className={`text-2xl font-black ${destacado ? 'text-white' : 'text-carbon-800'}`}
                >
                  {plan.nombre}
                </h3>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    destacado ? 'text-mostaza-200' : 'text-tomate-600'
                  }`}
                >
                  {plan.lema}
                </p>

                <p className="mt-6 flex items-end gap-1.5">
                  <span
                    className={`numeros-tabulares text-[2.75rem] font-black leading-none ${
                      destacado ? 'text-white' : 'text-carbon-800'
                    }`}
                  >
                    {formatCOP(plan.precio)}
                  </span>
                  <span
                    className={`pb-1 text-sm font-bold ${
                      destacado ? 'text-masa-300' : 'text-carbon-400'
                    }`}
                  >
                    COP
                  </span>
                </p>
                <p
                  className={`mt-1 text-xs font-bold uppercase tracking-wide ${
                    destacado ? 'text-mostaza-300' : 'text-carbon-400'
                  }`}
                >
                  Pago único
                </p>

                <p
                  className={`mt-5 text-[15px] leading-relaxed ${
                    destacado ? 'text-masa-200' : 'text-carbon-500'
                  }`}
                >
                  {plan.paraQuien}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.beneficios.map((beneficio) => (
                    <li key={beneficio} className="flex gap-2.5 text-[15px] leading-snug">
                      <span
                        className={`vineta-check ${
                          destacado ? 'bg-albahaca-400 text-carbon-800' : ''
                        }`}
                      >
                        <IconoCheck className="h-3 w-3" />
                      </span>
                      <span className={destacado ? 'text-masa-100' : 'text-carbon-700'}>
                        {beneficio}
                      </span>
                    </li>
                  ))}

                  {/* Decir qué NO trae evita devoluciones y molestias después. */}
                  {plan.noIncluye.map((falta) => (
                    <li
                      key={falta}
                      className={`flex gap-2.5 text-[15px] leading-snug ${
                        destacado ? 'text-carbon-300' : 'text-carbon-400'
                      }`}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-carbon-200/50 text-carbon-500">
                        <IconoCruz className="h-2.5 w-2.5" />
                      </span>
                      <span className="line-through decoration-carbon-400/60">{falta}</span>
                    </li>
                  ))}
                </ul>

                {/* El plan viaja en la URL: /checkout lo lee EN EL SERVIDOR y el
                    monto se recalcula allá. La URL no puede cambiar el precio. */}
                <Link
                  href={`/checkout?plan=${plan.id}`}
                  className={`mt-8 w-full ${destacado ? 'boton bg-tomate-500 text-white hover:bg-tomate-400' : 'boton-secundario'}`}
                >
                  {plan.textoBoton}
                  <IconoFlecha className="h-4 w-4" />
                </Link>

                <p
                  className={`mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold ${
                    destacado ? 'text-masa-300' : 'text-carbon-400'
                  }`}
                >
                  <IconoTarjeta className="h-3.5 w-3.5" />
                  Tarjeta débito o crédito · hasta 36 cuotas
                </p>
              </article>
            );
          })}
        </div>

        {/* ------------------------------------------------ tabla comparativa */}
        <div className="mt-16">
          <h3 className="text-center text-xl font-black text-carbon-800">
            Compara los tres planes
          </h3>

          {/* El scroll horizontal vive DENTRO de este contenedor: la página
              nunca se desplaza en horizontal en móvil. */}
          <div className="arrastre-x mt-6 rounded-3xl border border-masa-200 bg-white shadow-plato">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <caption className="sr-only">
                Comparación de lo que incluye cada plan de la membresía
              </caption>
              <thead>
                <tr className="border-b-2 border-masa-200 bg-masa-50">
                  <th scope="col" className="px-5 py-4 text-sm font-black text-carbon-800">
                    Lo que incluye
                  </th>
                  {PLANES.map((plan) => (
                    <th
                      key={plan.id}
                      scope="col"
                      className="px-4 py-4 text-center text-sm font-black text-carbon-800"
                    >
                      {plan.nombre}
                      <span className="numeros-tabulares mt-0.5 block text-xs font-bold text-tomate-600">
                        {formatCOP(plan.precio)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARACION.map((linea, indice) => (
                  <tr
                    key={linea.fila}
                    className={indice % 2 === 1 ? 'bg-masa-50/60' : undefined}
                  >
                    <th
                      scope="row"
                      className="px-5 py-3.5 text-sm font-semibold text-carbon-600"
                    >
                      {linea.fila}
                    </th>
                    <td className="px-4 py-3.5 text-center">
                      <Celda valor={linea.esencial} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Celda valor={linea.basico} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Celda valor={linea.avanzado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-center text-sm font-semibold text-carbon-500">
            <IconoEscudo className="h-4 w-4 shrink-0 text-albahaca-600" />
            Pago protegido por Wompi. Nosotros nunca vemos los datos de tu tarjeta.
          </p>
        </div>
      </div>
    </section>
  );
}
