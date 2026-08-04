import {
  IconoCandado,
  IconoCorazon,
  IconoEscudo,
  IconoEstrella,
  IconoPan,
  IconoPlato,
  IconoSobre,
  IconoTarjeta,
} from '@/components/Icons';

/**
 * ⚠️ IMPORTANTE ANTES DE PUBLICAR: estos testimonios son EJEMPLOS de estructura
 * y redacción, no personas reales. Reemplázalos por reseñas verdaderas de tus
 * alumnas (con su permiso) antes de sacar el sitio a producción: publicar
 * testimonios inventados como si fueran reales es publicidad engañosa y en
 * Colombia lo sanciona la SIC.
 */
const TESTIMONIOS = [
  {
    texto:
      'Yo quemaba el arroz. Literal. Hoy hago los almuerzos de mi casa sin estresarme y ya le vendo bandeja a tres vecinas los viernes.',
    nombre: 'Nombre de la alumna',
    detalle: 'Ciudad · plan Básico',
  },
  {
    texto:
      'Lo que más me sirvió fue la plantilla de costos. Estaba cobrando la torta a 35 y me estaba costando 41. Ahora sé mis números.',
    nombre: 'Nombre de la alumna',
    detalle: 'Ciudad · plan Avanzado',
  },
  {
    texto:
      'Las clases son cortas y eso lo cambió todo: las veo mientras hago la comida, no tengo que sentarme a "estudiar".',
    nombre: 'Nombre de la alumna',
    detalle: 'Ciudad · plan Esencial',
  },
];

const GARANTIAS = [
  {
    Icono: IconoSobre,
    titulo: 'Acceso el mismo día',
    texto: 'Al aprobarse el pago te llega el correo con el enlace. Si no llega en 10 minutos, revisa spam y escríbenos.',
  },
  {
    Icono: IconoCandado,
    titulo: 'Tu tarjeta va cifrada a Wompi',
    texto: 'Los datos de tu tarjeta viajan directo a la pasarela. Nuestro servidor solo recibe una autorización, nunca el número.',
  },
  {
    Icono: IconoCorazon,
    titulo: 'Soporte de verdad',
    texto: 'Respondemos por WhatsApp y por correo, de lunes a sábado. Detrás no hay un robot.',
  },
];

export function Confianza() {
  return (
    <section className="seccion relative overflow-hidden bg-carbon-800 text-masa-100">
      {/* Textura de azulejo oscuro, muy suave, para que el bloque negro no se
          sienta como un agujero en la página. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #fff8ec 0 14px, transparent 14px 28px), repeating-linear-gradient(-45deg, #f1b01f 0 14px, transparent 14px 28px)',
          backgroundSize: '40px 40px',
        }}
      />
      <IconoPan className="adorno -left-8 bottom-8 h-32 w-32 rotate-12 opacity-20" />
      <IconoPlato className="adorno -right-10 top-10 h-36 w-36 text-mostaza-300 opacity-25" />

      <div className="contenedor relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-mostaza-400/40 bg-white/5 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-mostaza-200">
            <IconoEstrella className="h-3.5 w-3.5" />
            Lo que dicen las alumnas
          </p>
          <h2 className="titulo-seccion mt-4 text-white">
            Mujeres que empezaron sin saber picar cebolla
          </h2>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIOS.map((testimonio) => (
            <li
              key={testimonio.texto}
              className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm"
            >
              <div className="flex gap-1 text-mostaza-300" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((estrella) => (
                  <IconoEstrella key={estrella} className="h-4 w-4" />
                ))}
              </div>
              <span className="sr-only">Calificación: 5 de 5 estrellas</span>

              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-masa-100">
                “{testimonio.texto}”
              </blockquote>

              <footer className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                {/* Avatar sin imagen: inicial sobre círculo de color. Cero
                    peticiones y sin fotos de banco de imágenes. */}
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tomate-500 text-base font-black text-white"
                >
                  {testimonio.nombre.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{testimonio.nombre}</p>
                  <p className="text-xs text-masa-300">{testimonio.detalle}</p>
                </div>
              </footer>
            </li>
          ))}
        </ul>

        {/* ---------------------------------------------- garantías y seguridad */}
        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {GARANTIAS.map(({ Icono, titulo, texto }) => (
            <li key={titulo} className="flex gap-4 rounded-3xl bg-white/[0.04] p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mostaza-300 text-carbon-800">
                <Icono className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-white">{titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-masa-300">{texto}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-masa-200">
            <IconoEscudo className="h-4 w-4 text-albahaca-300" />
            Pasarela Wompi (Grupo Bancolombia)
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-masa-200">
            <IconoTarjeta className="h-4 w-4 text-mostaza-300" />
            Visa · Mastercard · Amex · Diners
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-masa-200">
            <IconoCandado className="h-4 w-4 text-albahaca-300" />
            Conexión cifrada de punta a punta
          </span>
        </div>
      </div>
    </section>
  );
}
