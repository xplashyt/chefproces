import { IconoAjo, IconoLimon, IconoTaza } from '@/components/Icons';
import { formatCOP, PLANES } from '@/lib/plans';

const PRECIOS = PLANES.map((plan) => `${plan.nombre} ${formatCOP(plan.precio)}`).join(', ');

const PREGUNTAS = [
  {
    pregunta: '¿Sirve si nunca he cocinado nada en mi vida?',
    respuesta:
      'Para eso está hecho. El primer módulo empieza por cómo agarrar el cuchillo y cómo se comporta el fuego. Si ya cocinas, puedes saltar directo al módulo que te interese.',
  },
  {
    pregunta: '¿Cuánto cuesta y hay mensualidades?',
    respuesta: `Es un pago único: ${PRECIOS}. No hay mensualidades, no hay renovación automática y no guardamos tu tarjeta para volver a cobrarte.`,
  },
  {
    pregunta: '¿Cómo recibo el acceso?',
    respuesta:
      'Cuando el banco aprueba el pago, te llega un correo con el enlace de entrada y tu comprobante. Suele tardar menos de un minuto. Si no lo ves, revisa spam o correo no deseado antes de escribirnos.',
  },
  {
    pregunta: '¿Puedo pagar a cuotas?',
    respuesta:
      'Sí. Con tarjeta de crédito puedes diferir hasta 36 cuotas; las cuotas y los intereses los define tu banco, no nosotros. También puedes pagar con débito en un solo pago.',
  },
  {
    pregunta: '¿Necesito una cocina equipada o utensilios caros?',
    respuesta:
      'No. Todo está pensado para una estufa, una olla, un sartén y un cuchillo. Cuando una clase pide algo especial, siempre mostramos el reemplazo casero.',
  },
  {
    pregunta: '¿Los ingredientes son fáciles de conseguir en Colombia?',
    respuesta:
      'Sí. Las recetas usan lo que hay en la tienda de barrio o la plaza de mercado, con precios en pesos y tabla de reemplazos por si algo no se encuentra en tu ciudad.',
  },
  {
    pregunta: '¿De verdad puedo empezar a vender lo que cocino?',
    respuesta:
      'El plan Avanzado incluye los módulos de costos, precios y ventas por WhatsApp, más plantillas listas. No prometemos una cifra: eso depende de tu ciudad, tu dedicación y tu clientela. Sí te damos el método y los números para no vender a pérdida.',
  },
  {
    pregunta: '¿Cuánto tiempo tengo el acceso?',
    respuesta:
      'Esencial: 6 meses. Básico: 12 meses con las actualizaciones que salgan en ese periodo. Avanzado: de por vida, incluyendo lo nuevo que agreguemos.',
  },
  {
    pregunta: '¿Puedo cambiarme de plan después?',
    respuesta:
      'Sí. Escríbenos con el correo de tu compra y pagas solo la diferencia entre el plan que tienes y el que quieres.',
  },
  {
    pregunta: '¿Es seguro poner mi tarjeta aquí?',
    respuesta:
      'El pago lo procesa Wompi, la pasarela del Grupo Bancolombia. Los datos de tu tarjeta viajan cifrados directo a ellos: este sitio nunca los recibe, ni los guarda, ni los puede ver.',
  },
];

/**
 * Preguntas frecuentes con <details>/<summary> nativos.
 *
 * ¿Por qué así y no un acordeón en React? Porque el navegador ya trae este
 * comportamiento: abre y cierra con Enter o Espacio, el lector de pantalla
 * anuncia "expandido/contraído" solo, funciona con JavaScript desactivado y el
 * buscador del navegador (Ctrl+F) encuentra el texto de las respuestas cerradas.
 * Un acordeón propio necesitaría estado, aria-expanded, manejo de teclado y
 * varios KB de JavaScript para hacer exactamente lo mismo, peor.
 */
export function Preguntas() {
  return (
    <section id="preguntas" className="seccion relative overflow-hidden bg-white">
      <IconoLimon className="adorno right-[5%] top-14 h-16 w-16 animate-flotar opacity-70" />
      <IconoAjo className="adorno left-[3%] bottom-20 hidden h-16 w-16 animate-flotar opacity-70 [animation-delay:-3s] lg:block" />

      <div className="contenedor relative">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="antetitulo">
              <IconoTaza className="h-3.5 w-3.5" />
              Preguntas frecuentes
            </p>
            <h2 className="titulo-seccion mt-4">Lo que casi todas preguntan antes de entrar</h2>
          </div>

          <div className="mt-10 space-y-3">
            {PREGUNTAS.map((item) => (
              <details
                key={item.pregunta}
                className="group rounded-3xl border border-masa-200 bg-masa-50 transition-colors open:border-tomate-200 open:bg-white open:shadow-plato"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-[1.0625rem] font-bold text-carbon-800 sm:px-6 [&::-webkit-details-marker]:hidden">
                  {item.pregunta}
                  {/* El signo gira 45° al abrir: se convierte en una "x" sin
                      cambiar de icono ni usar JavaScript. */}
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tomate-100 text-tomate-600 transition-transform duration-200 group-open:rotate-45"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" focusable="false">
                      <path
                        d="M12 5v14M5 12h14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-dashed border-masa-300 px-5 pb-5 pt-4 sm:px-6">
                  <p className="text-[15px] leading-relaxed text-carbon-500">{item.respuesta}</p>
                </div>
              </details>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-carbon-500">
            ¿Te quedó otra duda?{' '}
            <a
              href="mailto:hola@sazonpropio.co"
              className="font-bold text-tomate-600 underline decoration-mostaza-300 decoration-2 underline-offset-2"
            >
              Escríbenos y te respondemos hoy mismo
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
