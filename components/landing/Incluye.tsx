import {
  IconoBalanza,
  IconoCucharon,
  IconoCupcake,
  IconoLibro,
  IconoSarten,
  IconoTemporizador,
  IconoWhatsapp,
  IconoHoja,
} from '@/components/Icons';
import type { PropsIcono } from '@/components/Icons';

interface Beneficio {
  Icono: (props: PropsIcono) => JSX.Element;
  titulo: string;
  texto: string;
  /** Color de la "pastilla" del icono: rota para que la grilla no se vea plana. */
  tono: string;
}

const BENEFICIOS: Beneficio[] = [
  {
    Icono: IconoSarten,
    titulo: 'Técnica primero, recetas después',
    texto:
      'Cuando entiendes el fuego, el sofrito y la sal, cualquier receta te sale. Empezamos por ahí, no por copiar pasos.',
    tono: 'bg-tomate-100 text-tomate-600',
  },
  {
    Icono: IconoTemporizador,
    titulo: 'Clases de 15 minutos',
    texto:
      'Grabadas en vertical para verlas desde el celular mientras cocinas. Avanzas cuando puedas, sin horarios.',
    tono: 'bg-mostaza-100 text-mostaza-600',
  },
  {
    Icono: IconoLibro,
    titulo: '120 recetas con lista de mercado',
    texto:
      'Cada receta trae cuánto rinde, cuánto cuesta y qué reemplazar si no encuentras un ingrediente.',
    tono: 'bg-albahaca-100 text-albahaca-600',
  },
  {
    Icono: IconoCupcake,
    titulo: 'Postres y panadería casera',
    texto:
      'Torta húmeda, brownies, pan y hojaldre. Lo que más piden y lo que mejor se vende por encargo.',
    tono: 'bg-tomate-100 text-tomate-600',
  },
  {
    Icono: IconoBalanza,
    titulo: 'Costos y precios sin miedo',
    texto:
      'Plantilla para saber cuánto te cuesta un plato y cuánto cobrar sin regalar tu tiempo ni asustar a la clienta.',
    tono: 'bg-mostaza-100 text-mostaza-600',
  },
  {
    Icono: IconoWhatsapp,
    titulo: 'Comunidad de alumnas',
    texto:
      'Grupo donde preguntas, muestras tus platos y recibes ayuda de mujeres que están en tu mismo punto.',
    tono: 'bg-albahaca-100 text-albahaca-600',
  },
];

export function Incluye() {
  return (
    <section id="incluye" className="seccion relative overflow-hidden bg-white">
      {/* Adornos discretos en los bordes: hojas de albahaca y una cuchara. */}
      <IconoHoja className="adorno -left-6 top-16 h-32 w-32 rotate-12 text-albahaca-200" />
      <IconoCucharon className="adorno -right-4 bottom-10 h-28 w-28 -rotate-12 text-masa-200" />

      <div className="contenedor relative">
        <div className="max-w-2xl">
          <p className="antetitulo">Qué te llevas</p>
          <h2 className="titulo-seccion mt-4">
            No es un curso más: es aprender a cocinar como se aprende en una cocina de verdad
          </h2>
          <p className="parrafo mt-4">
            Nada de teoría eterna. Cada clase termina con algo hecho, probado y comido. Si nunca has
            prendido una estufa, este es el lugar para empezar.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFICIOS.map(({ Icono, titulo, texto, tono }) => (
            <li
              key={titulo}
              className="tarjeta group transition-transform duration-200 hover:-translate-y-1"
            >
              <span
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${tono}`}
              >
                <Icono className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-black leading-snug text-carbon-800">{titulo}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-carbon-500">{texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
