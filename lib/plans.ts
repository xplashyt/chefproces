/**
 * ÚNICA fuente de verdad de los planes y de los precios.
 *
 * Todo (landing, checkout, API de pago, correos) lee de aquí. El navegador
 * jamás envía el monto: solo manda el id del plan y el servidor busca el precio
 * en esta tabla. Cambiar un precio es cambiar una línea de este archivo.
 */

export type PlanId = 'esencial' | 'basico' | 'avanzado';

export interface Plan {
  id: PlanId;
  nombre: string;
  /** Gancho corto que se muestra debajo del nombre. */
  lema: string;
  /**
   * Precio en pesos colombianos, sin centavos. Wompi cobra en centavos.
   * En el sitio solo existen tres precios (2.000 / 69.900 / 494.900): no hay
   * precios tachados ni "antes de", para que nada suene a promoción inflada.
   */
  precio: number;
  /** Marca visual de "el más elegido": solo uno debería tenerla en true. */
  destacado: boolean;
  /** Para quién es, en una frase honesta. */
  paraQuien: string;
  beneficios: string[];
  /** Lo que NO trae, dicho de frente: evita devoluciones y desconfianza. */
  noIncluye: string[];
  /** Texto del botón. */
  textoBoton: string;
}

/** Moneda: Wompi solo opera COP en Colombia. */
export const MONEDA = 'COP' as const;

export const PLANES: Plan[] = [
  {
    id: 'esencial',
    nombre: 'Esencial',
    lema: 'Aprende a cocinar bien para tu casa',
    precio: 2000,
    destacado: false,
    paraQuien: 'Para ti que arrancas de cero y quieres dejar de improvisar en la cocina.',
    beneficios: [
      'Módulos 1 y 2: manejo del cuchillo, fuego y sazón',
      '30 recetas base en PDF con lista de mercado',
      'Tabla de reemplazos con ingredientes de tienda de barrio',
      'Acceso por 6 meses, a tu ritmo',
    ],
    noIncluye: ['Módulo de negocio', 'Revisión personalizada de tus platos'],
    textoBoton: 'Empezar con Esencial',
  },
  {
    id: 'basico',
    nombre: 'Básico',
    lema: 'El programa completo de cocina',
    precio: 69900,
    destacado: true,
    paraQuien: 'Para ti que quieres cocinar rico todos los días y empezar a recibir pedidos de conocidas.',
    beneficios: [
      'Los 6 módulos completos, de cero a plato terminado',
      '120 recetas con video corto paso a paso',
      'Recetario de postres y panadería casera',
      'Comunidad de WhatsApp con las demás alumnas',
      'Plantilla para calcular cuánto te cuesta un plato',
      'Acceso por 12 meses + actualizaciones',
    ],
    noIncluye: ['Asesoría uno a uno por videollamada'],
    textoBoton: 'Quiero el Básico',
  },
  {
    id: 'avanzado',
    nombre: 'Avanzado',
    lema: 'De cocinar rico a cobrar por lo que cocinas',
    precio: 494900,
    destacado: false,
    paraQuien: 'Para ti que ya quieres vender: almuerzos, postres, tortas o menús por encargo.',
    beneficios: [
      'Todo lo del plan Básico, sin recortes',
      'Módulo 7: precios, costos y cómo cobrar sin regalar tu trabajo',
      'Módulo 8: fotos con el celular y pedidos por WhatsApp',
      'Plantillas listas: lista de precios, menú y mensaje de cierre de venta',
      'Guía de manipulación de alimentos y buenas prácticas',
      'Revisión escrita de tus 3 primeros platos por el equipo',
      'Acceso de por vida',
    ],
    noIncluye: [],
    textoBoton: 'Quiero el Avanzado',
  },
];

/** Plan que se abre si alguien llega a /checkout sin parámetro válido. */
export const PLAN_POR_DEFECTO: PlanId = 'basico';

/** Type guard: valida lo que llega por querystring o por el body de la API. */
export function esPlanId(valor: unknown): valor is PlanId {
  return typeof valor === 'string' && PLANES.some((plan) => plan.id === valor);
}

/** Devuelve el plan o `undefined`; quien llama decide el fallback. */
export function buscarPlan(id: unknown): Plan | undefined {
  return esPlanId(id) ? PLANES.find((plan) => plan.id === id) : undefined;
}

/** Devuelve siempre un plan: útil en la página de checkout. */
export function planOPorDefecto(id: unknown): Plan {
  // El "!" es seguro: PLAN_POR_DEFECTO es un id que existe en PLANES.
  return buscarPlan(id) ?? PLANES.find((plan) => plan.id === PLAN_POR_DEFECTO)!;
}

/**
 * Wompi cobra en centavos. Multiplicamos aquí, en un solo lugar, para que
 * ninguna ruta se equivoque con dos ceros de más o de menos.
 */
export function precioEnCentavos(plan: Plan): number {
  return plan.precio * 100;
}

/**
 * Formato colombiano: punto como separador de miles y sin decimales.
 *
 * Está hecho a mano en vez de con Intl.NumberFormat porque el ICU de Node y el
 * del navegador no siempre coinciden (uno mete espacio duro después del "$" y
 * el otro no). Un formateador determinista evita que el precio del HTML del
 * servidor difiera del que pinta el cliente.
 */
export function formatCOP(valor: number): string {
  const entero = Math.round(Math.abs(valor)).toString();
  const conPuntos = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${valor < 0 ? '-' : ''}$${conPuntos}`;
}
