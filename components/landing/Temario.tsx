import { IconoCheck, IconoCuchillo, IconoFuego, IconoTemporizador } from '@/components/Icons';
import { PLANES, type PlanId } from '@/lib/plans';

interface Modulo {
  titulo: string;
  descripcion: string;
  clases: number;
  minutos: number;
  /** En qué planes está incluido. Se dibuja con los nombres reales de PLANES. */
  incluidoEn: PlanId[];
}

const TODOS: PlanId[] = ['esencial', 'basico', 'avanzado'];
const DESDE_BASICO: PlanId[] = ['basico', 'avanzado'];
const SOLO_AVANZADO: PlanId[] = ['avanzado'];

const MODULOS: Modulo[] = [
  {
    titulo: 'Tu cocina lista para trabajar',
    descripcion:
      'Cómo agarrar el cuchillo sin cortarte, picar parejo, y tener todo listo antes de prender la estufa. La diferencia entre cocinar tranquila y cocinar corriendo.',
    clases: 6,
    minutos: 78,
    incluidoEn: TODOS,
  },
  {
    titulo: 'Fuego, sal y sazón',
    descripcion:
      'Por qué tu comida sabe "a nada" y cómo arreglarlo: el sofrito base, cuándo salar, el toque de ácido y las hierbas que sí valen la pena.',
    clases: 7,
    minutos: 92,
    incluidoEn: TODOS,
  },
  {
    titulo: 'Arroces, granos y acompañamientos',
    descripcion:
      'Arroz suelto siempre, frijoles que no quedan duros, papas doradas y patacón que no se ablanda. Las bases que se repiten toda la semana.',
    clases: 8,
    minutos: 104,
    incluidoEn: DESDE_BASICO,
  },
  {
    titulo: 'Proteínas sin miedo',
    descripcion:
      'Pollo jugoso, carne en su punto, pescado que no se deshace y huevos perfectos. Con la prueba del dedo para saber cuándo está listo sin cortarlo.',
    clases: 9,
    minutos: 121,
    incluidoEn: DESDE_BASICO,
  },
  {
    titulo: 'Almuerzos completos y sopas',
    descripcion:
      'Menús de casa que rinden: ajiaco, sancocho, sudados, cremas y el almuerzo del día armado en 45 minutos con un solo mercado.',
    clases: 10,
    minutos: 138,
    incluidoEn: DESDE_BASICO,
  },
  {
    titulo: 'Postres y panadería casera',
    descripcion:
      'Torta húmeda que no se baja, brownies, arequipe, pan y hojaldre. Los que más se venden por encargo y los que más piden en cumpleaños.',
    clases: 11,
    minutos: 152,
    incluidoEn: DESDE_BASICO,
  },
  {
    titulo: 'Costos, precios y cómo cobrar',
    descripcion:
      'Cuánto te cuesta cada plato de verdad (incluido el gas y tu tiempo), cómo poner el precio, cómo subirlo y qué responder cuando te dicen "está muy caro".',
    clases: 7,
    minutos: 96,
    incluidoEn: SOLO_AVANZADO,
  },
  {
    titulo: 'Vender por WhatsApp y fotos con el celular',
    descripcion:
      'Fotos con luz de ventana, lista de precios lista para enviar, mensajes de cierre y cómo organizar pedidos sin enredarte.',
    clases: 6,
    minutos: 74,
    incluidoEn: SOLO_AVANZADO,
  },
];

const TOTAL_CLASES = MODULOS.reduce((suma, modulo) => suma + modulo.clases, 0);
const TOTAL_MINUTOS = MODULOS.reduce((suma, modulo) => suma + modulo.minutos, 0);

function nombrePlan(id: PlanId): string {
  return PLANES.find((plan) => plan.id === id)?.nombre ?? id;
}

export function Temario() {
  return (
    <section id="temario" className="seccion relative overflow-hidden bg-masa-100 lunares">
      <div className="contenedor relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="antetitulo">
              <IconoCuchillo className="h-3.5 w-3.5" />
              Temario completo
            </p>
            <h2 className="titulo-seccion mt-4">Ocho módulos, en el orden en que se aprende</h2>
            <p className="parrafo mt-4">
              Van de lo más básico a lo más rentable. Puedes verlos en orden o saltar al que
              necesitas hoy.
            </p>
          </div>

          <dl className="numeros-tabulares flex gap-3">
            <div className="rounded-2xl border border-masa-300 bg-white px-4 py-3 text-center">
              <dt className="text-[11px] font-bold uppercase tracking-wide text-carbon-500">Clases</dt>
              <dd className="text-2xl font-black text-tomate-600">{TOTAL_CLASES}</dd>
            </div>
            <div className="rounded-2xl border border-masa-300 bg-white px-4 py-3 text-center">
              <dt className="text-[11px] font-bold uppercase tracking-wide text-carbon-500">Horas</dt>
              <dd className="text-2xl font-black text-tomate-600">
                {Math.round(TOTAL_MINUTOS / 60)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Lista ordenada: el orden importa (es un temario), así que <ol> y no
            <div>. La línea vertical punteada es un borde, no una imagen. */}
        <ol className="mt-12 space-y-4">
          {MODULOS.map((modulo, indice) => {
            const esDeNegocio = modulo.incluidoEn.length === 1;
            return (
              <li key={modulo.titulo} className="relative pl-14 sm:pl-16">
                {/* Número del módulo, sobre la línea del tiempo. */}
                <span className="numeros-tabulares absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-carbon-800 bg-white text-base font-black text-carbon-800 sm:h-12 sm:w-12">
                  {indice + 1}
                </span>
                {/* La línea no se dibuja después del último módulo. */}
                {indice < MODULOS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[1.3rem] top-12 h-[calc(100%-2rem)] w-0 border-l-2 border-dashed border-masa-400 sm:left-[1.42rem]"
                  />
                )}

                <div
                  className={`rounded-3xl border p-5 sm:p-6 ${
                    esDeNegocio
                      ? 'border-tomate-200 bg-tomate-50'
                      : 'border-masa-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-lg font-black leading-snug text-carbon-800 sm:text-xl">
                      {modulo.titulo}
                    </h3>
                    <span className="chip numeros-tabulares shrink-0">
                      <IconoTemporizador className="h-3.5 w-3.5 text-tomate-500" />
                      {modulo.clases} clases · {modulo.minutos} min
                    </span>
                  </div>

                  <p className="mt-2.5 text-[15px] leading-relaxed text-carbon-500">
                    {modulo.descripcion}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {esDeNegocio && (
                      <span className="chip border-tomate-300 bg-white text-tomate-700">
                        <IconoFuego className="h-3.5 w-3.5" />
                        Módulo de negocio
                      </span>
                    )}
                    <span className="text-xs font-bold text-carbon-400">Incluido en:</span>
                    {modulo.incluidoEn.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full bg-albahaca-100 px-2.5 py-1 text-xs font-bold text-albahaca-700"
                      >
                        <IconoCheck className="h-3 w-3" />
                        {nombrePlan(id)}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
