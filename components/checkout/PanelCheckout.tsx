'use client';

/**
 * EL ÚNICO COMPONENTE CLIENTE DEL SITIO.
 *
 * Aquí sí hace falta JavaScript, por dos razones concretas:
 *  1) tokenizar la tarjeta contra Wompi desde el navegador, para que el número
 *     y el CVC nunca toquen nuestro servidor;
 *  2) hacer polling del estado del pago, porque con tarjeta Wompi responde
 *     PENDING y resuelve segundos después (a veces con 3-D Secure de por medio).
 *
 * Todo lo demás del sitio es HTML de servidor.
 */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  IconoCandado,
  IconoCheck,
  IconoCruz,
  IconoEscudo,
  IconoFlecha,
  IconoSobre,
  IconoTarjeta,
  IconoTemporizador,
} from '@/components/Icons';
import {
  detectarMarca,
  formatearNumero,
  formatearVencimiento,
  largoCvc,
  validarCvc,
  validarNumero,
  validarVencimiento,
  type MarcaTarjeta,
} from '@/lib/card';
import {
  CUOTAS_DISPONIBLES,
  soloDigitos,
  TIPOS_DOCUMENTO,
  validarCelular,
  validarCorreo,
  validarDocumento,
  validarNombre,
  type TipoDocumento,
} from '@/lib/payment-options';
import { formatCOP, type Plan } from '@/lib/plans';
import { tokenizarTarjeta } from '@/lib/wompi-browser';

/** Etapas de la compra. El componente es una máquina de estados simple. */
type Etapa = 'formulario' | 'procesando' | 'esperando' | 'aprobado' | 'fallido';

interface Campos {
  nombre: string;
  correo: string;
  celular: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  numeroTarjeta: string;
  vencimiento: string;
  cvc: string;
  cuotas: string;
  acepta: boolean;
}

const CAMPOS_INICIALES: Campos = {
  nombre: '',
  correo: '',
  celular: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  numeroTarjeta: '',
  vencimiento: '',
  cvc: '',
  cuotas: '1',
  acepta: false,
};

/** Nombre visible de la franquicia para la pastilla junto al campo. */
const NOMBRE_MARCA: Record<MarcaTarjeta, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'Amex',
  DINERS: 'Diners',
  DESCONOCIDA: '',
};

/** Cada 3,5 s durante ~2 minutos: suficiente para 3-D Secure sin castigar la API. */
const INTERVALO_POLLING = 3500;
const MAXIMO_INTENTOS = 34;

export function PanelCheckout({ plan }: { plan: Plan }) {
  const [campos, setCampos] = useState<Campos>(CAMPOS_INICIALES);
  const [errores, setErrores] = useState<Partial<Record<keyof Campos, string>>>({});
  const [etapa, setEtapa] = useState<Etapa>('formulario');
  const [mensaje, setMensaje] = useState<string>('');
  const [transaccionId, setTransaccionId] = useState<string | null>(null);
  const [referencia, setReferencia] = useState<string>('');
  const [intentos, setIntentos] = useState(0);

  // Para llevar el foco al primer campo con error: sin esto, quien navega con
  // teclado o lector de pantalla no sabe qué hay que corregir.
  const refs = useRef<Partial<Record<keyof Campos, HTMLElement | null>>>({});

  const marca = detectarMarca(campos.numeroTarjeta);

  /** La llave pública se inlinea en el bundle: es su uso previsto. */
  const llavePublica = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? '';

  const actualizar = useCallback(<C extends keyof Campos>(campo: C, valor: Campos[C]) => {
    setCampos((previos) => ({ ...previos, [campo]: valor }));
    // El error se limpia al escribir: mantenerlo mientras la usuaria corrige es
    // ruido que la hace sentir que sigue equivocada.
    setErrores((previos) => {
      if (!previos[campo]) return previos;
      const copia = { ...previos };
      delete copia[campo];
      return copia;
    });
  }, []);

  function validarTodo(): Partial<Record<keyof Campos, string>> {
    const nuevos: Partial<Record<keyof Campos, string>> = {};

    const nombre = validarNombre(campos.nombre);
    if (nombre) nuevos.nombre = nombre;

    const correo = validarCorreo(campos.correo);
    if (correo) nuevos.correo = correo;

    const celular = validarCelular(campos.celular);
    if (celular) nuevos.celular = celular;

    const documento = validarDocumento(campos.numeroDocumento);
    if (documento) nuevos.numeroDocumento = documento;

    const tarjeta = validarNumero(campos.numeroTarjeta);
    if (tarjeta) nuevos.numeroTarjeta = tarjeta;

    const vence = validarVencimiento(campos.vencimiento);
    if (vence.error) nuevos.vencimiento = vence.error;

    const cvc = validarCvc(campos.cvc, marca);
    if (cvc) nuevos.cvc = cvc;

    if (!campos.acepta) nuevos.acepta = 'Necesitamos tu autorización para poder cobrar.';

    return nuevos;
  }

  async function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (etapa === 'procesando' || etapa === 'esperando') return;

    const nuevos = validarTodo();
    setErrores(nuevos);

    const primerError = Object.keys(nuevos)[0] as keyof Campos | undefined;
    if (primerError) {
      refs.current[primerError]?.focus();
      return;
    }

    setEtapa('procesando');
    setMensaje('Validando tu tarjeta…');

    try {
      // Los tokens de aceptación NO se piden aquí: caducan, y el servidor ya los
      // pide en /api/wompi/pay justo antes de crear la transacción, que es donde
      // se usan. Pedirlos también desde el navegador solo agregaba una petición
      // que podía tumbar el cobro sin haberlo intentado.

      // 1) Tokenización: el número y el CVC salen del navegador directo a Wompi.
      const vence = validarVencimiento(campos.vencimiento);
      if (!vence.partes) throw new Error('Vencimiento inválido');

      const token = await tokenizarTarjeta(llavePublica, {
        numero: soloDigitos(campos.numeroTarjeta),
        cvc: soloDigitos(campos.cvc),
        mes: vence.partes.mes,
        anio: vence.partes.anio,
        titular: campos.nombre.trim(),
      });

      setMensaje('Autorizando el pago con tu banco…');

      // 2) Creamos la transacción en NUESTRO servidor. Se manda el id del plan,
      //    jamás el monto: el precio lo pone el servidor desde lib/plans.ts.
      const respuesta = await fetch('/api/wompi/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.id,
          tokenTarjeta: token.id,
          cuotas: Number(campos.cuotas),
          nombre: campos.nombre,
          correo: campos.correo,
          celular: campos.celular,
          tipoDocumento: campos.tipoDocumento,
          numeroDocumento: campos.numeroDocumento,
          aceptaTerminos: campos.acepta,
        }),
      });

      const datos = (await respuesta.json().catch(() => null)) as
        | { id?: string; estado?: string; referencia?: string; mensaje?: string }
        | null;

      if (!respuesta.ok || !datos?.id) {
        setEtapa('fallido');
        setMensaje(datos?.mensaje ?? 'No pudimos procesar el pago. Intenta de nuevo.');
        return;
      }

      setTransaccionId(datos.id);
      setReferencia(datos.referencia ?? '');
      setIntentos(0);

      if (datos.estado === 'APPROVED') {
        setEtapa('aprobado');
        setMensaje('¡Pago aprobado! Ya te enviamos el acceso a tu correo.');
        return;
      }

      // 3) A esperar: el polling arranca en el efecto de abajo.
      setEtapa('esperando');
      setMensaje('Estamos confirmando el pago con tu banco. No cierres esta página.');
    } catch (fallo) {
      setEtapa('fallido');
      if (fallo instanceof TypeError) {
        // fetch() nunca llegó a destino: sin internet, o el navegador cortó
        // la conexión antes de recibir respuesta (a nuestro servidor o, si
        // tokenizarTarjeta ya la atrapó, esto no debería ocurrir por la
        // tarjeta — queda como red de seguridad para cualquier otro fetch).
        setMensaje('No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.');
      } else {
        setMensaje(
          fallo instanceof Error && fallo.message
            ? fallo.message
            : 'Algo falló al procesar el pago. No se te cobró; intenta otra vez.',
        );
      }
    }
  }

  /**
   * Polling del estado. Va en un efecto (y no en un bucle dentro del submit)
   * para que se cancele solo si la usuaria cierra o navega: sin ese cleanup, el
   * temporizador seguiría corriendo y actualizando un componente desmontado.
   */
  useEffect(() => {
    if (etapa !== 'esperando' || !transaccionId) return;

    if (intentos >= MAXIMO_INTENTOS) {
      setEtapa('fallido');
      setMensaje(
        'El banco se está tomando más de lo normal. Revisa tu correo en unos minutos: si el pago se aprueba, el acceso llega igual. Si no, escríbenos con tu referencia.',
      );
      return;
    }

    let cancelado = false;

    const temporizador = setTimeout(async () => {
      try {
        const respuesta = await fetch(`/api/wompi/status/${transaccionId}`, { cache: 'no-store' });
        const datos = (await respuesta.json().catch(() => null)) as
          | { estado?: string; mensaje?: string }
          | null;

        if (cancelado) return;

        if (datos?.estado === 'APPROVED') {
          setEtapa('aprobado');
          setMensaje(datos.mensaje ?? '¡Pago aprobado! Revisa tu correo.');
          return;
        }

        if (datos?.estado && datos.estado !== 'PENDING') {
          setEtapa('fallido');
          setMensaje(datos.mensaje ?? 'El pago no se completó.');
          return;
        }

        // Sigue PENDING (o la consulta falló): se reintenta.
        setIntentos((previos) => previos + 1);
      } catch {
        if (!cancelado) setIntentos((previos) => previos + 1);
      }
    }, INTERVALO_POLLING);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [etapa, transaccionId, intentos]);

  const procesando = etapa === 'procesando' || etapa === 'esperando';

  /* ----------------------------------------------------------- pantalla final */
  if (etapa === 'aprobado') {
    return (
      <div className="tarjeta mx-auto max-w-xl text-center">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-albahaca-100 text-albahaca-600">
          <IconoCheck className="h-8 w-8" />
        </span>
        <h2 className="text-2xl font-black text-carbon-800">¡Listo, ya estás dentro!</h2>
        <p className="parrafo mt-3">
          Tu pago del plan <strong className="text-carbon-800">{plan.nombre}</strong> quedó
          aprobado. Te enviamos a tu correo el enlace de acceso y el comprobante.
        </p>

        <div className="numeros-tabulares mt-6 rounded-2xl border border-masa-200 bg-masa-50 p-5 text-left text-sm">
          <div className="flex justify-between gap-4 py-1">
            <span className="text-carbon-500">Plan</span>
            <span className="font-bold text-carbon-800">{plan.nombre}</span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-carbon-500">Valor pagado</span>
            <span className="font-bold text-carbon-800">{formatCOP(plan.precio)} COP</span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-carbon-500">Correo</span>
            <span className="font-bold text-carbon-800">{campos.correo}</span>
          </div>
          {referencia && (
            <div className="flex justify-between gap-4 py-1">
              <span className="text-carbon-500">Referencia</span>
              <span className="font-mono text-xs text-carbon-700">{referencia}</span>
            </div>
          )}
        </div>

        <p className="mt-5 text-sm text-carbon-500">
          ¿No ves el correo en 10 minutos? Revisa spam o correo no deseado y, si sigue sin llegar,
          escríbenos con tu referencia.
        </p>

        <Link href="/" className="boton-secundario mt-7">
          Volver al inicio
        </Link>
      </div>
    );
  }

  /* ------------------------------------------------------ formulario y espera */
  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
      {/* ------------------------------------------------------------ columna 1 */}
      <form onSubmit={alEnviar} noValidate className="tarjeta">
        <fieldset disabled={procesando} className="min-w-0">
          <legend className="sr-only">Datos para tu inscripción y pago</legend>

          <h2 className="text-xl font-black text-carbon-800">1. Tus datos</h2>
          <p className="mt-1 text-sm text-carbon-500">
            El acceso llega al correo que escribas aquí. Revísalo bien.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nombre" className="etiqueta">
                Nombre y apellido
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                className="campo"
                placeholder="María Fernanda Gómez"
                value={campos.nombre}
                onChange={(evento) => actualizar('nombre', evento.target.value)}
                aria-invalid={Boolean(errores.nombre)}
                aria-describedby={errores.nombre ? 'error-nombre' : undefined}
                ref={(elemento) => {
                  refs.current.nombre = elemento;
                }}
              />
              {errores.nombre && (
                <p id="error-nombre" role="alert" className="error-campo">
                  <IconoCruz className="mt-0.5 h-3 w-3 shrink-0" />
                  {errores.nombre}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="correo" className="etiqueta">
                Correo electrónico
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                inputMode="email"
                autoComplete="email"
                className="campo"
                placeholder="tucorreo@gmail.com"
                value={campos.correo}
                onChange={(evento) => actualizar('correo', evento.target.value)}
                aria-invalid={Boolean(errores.correo)}
                aria-describedby={errores.correo ? 'error-correo' : 'ayuda-correo'}
                ref={(elemento) => {
                  refs.current.correo = elemento;
                }}
              />
              {errores.correo ? (
                <p id="error-correo" role="alert" className="error-campo">
                  <IconoCruz className="mt-0.5 h-3 w-3 shrink-0" />
                  {errores.correo}
                </p>
              ) : (
                <p id="ayuda-correo" className="ayuda-campo">
                  Aquí te enviamos el acceso y el comprobante.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="celular" className="etiqueta">
                Celular
              </label>
              <input
                id="celular"
                name="celular"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                className="campo numeros-tabulares"
                placeholder="3001234567"
                value={campos.celular}
                onChange={(evento) => actualizar('celular', soloDigitos(evento.target.value))}
                aria-invalid={Boolean(errores.celular)}
                aria-describedby={errores.celular ? 'error-celular' : undefined}
                ref={(elemento) => {
                  refs.current.celular = elemento;
                }}
              />
              {errores.celular && (
                <p id="error-celular" role="alert" className="error-campo">
                  <IconoCruz className="mt-0.5 h-3 w-3 shrink-0" />
                  {errores.celular}
                </p>
              )}
            </div>

            <div className="grid grid-cols-[7.5rem_1fr] gap-2">
              <div>
                <label htmlFor="tipoDocumento" className="etiqueta">
                  Tipo
                </label>
                <select
                  id="tipoDocumento"
                  name="tipoDocumento"
                  className="campo px-3"
                  value={campos.tipoDocumento}
                  onChange={(evento) =>
                    actualizar('tipoDocumento', evento.target.value as TipoDocumento)
                  }
                >
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <option key={tipo.valor} value={tipo.valor}>
                      {tipo.valor}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="numeroDocumento" className="etiqueta">
                  Documento
                </label>
                <input
                  id="numeroDocumento"
                  name="numeroDocumento"
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  className="campo numeros-tabulares"
                  placeholder="1020304050"
                  value={campos.numeroDocumento}
                  onChange={(evento) =>
                    actualizar('numeroDocumento', soloDigitos(evento.target.value))
                  }
                  aria-invalid={Boolean(errores.numeroDocumento)}
                  aria-describedby={errores.numeroDocumento ? 'error-documento' : undefined}
                  ref={(elemento) => {
                    refs.current.numeroDocumento = elemento;
                  }}
                />
              </div>
              {errores.numeroDocumento && (
                <p id="error-documento" role="alert" className="error-campo col-span-2">
                  <IconoCruz className="mt-0.5 h-3 w-3 shrink-0" />
                  {errores.numeroDocumento}
                </p>
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------- tarjeta */}
          <h2 className="mt-9 flex items-center gap-2 text-xl font-black text-carbon-800">
            2. Tu tarjeta
            <span className="chip border-albahaca-200 bg-albahaca-50 text-albahaca-700">
              <IconoCandado className="h-3.5 w-3.5" />
              Cifrada
            </span>
          </h2>
          <p className="mt-1 text-sm text-carbon-500">
            Estos datos van directo a Wompi. Este sitio no los recibe ni los guarda.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="numeroTarjeta" className="etiqueta">
                Número de la tarjeta
              </label>
              <div className="relative">
                <input
                  id="numeroTarjeta"
                  name="numeroTarjeta"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  className="campo numeros-tabulares pr-24 tracking-wide"
                  placeholder="4242 4242 4242 4242"
                  value={campos.numeroTarjeta}
                  onChange={(evento) =>
                    actualizar('numeroTarjeta', formatearNumero(evento.target.value))
                  }
                  aria-invalid={Boolean(errores.numeroTarjeta)}
                  aria-describedby={errores.numeroTarjeta ? 'error-tarjeta' : undefined}
                  ref={(elemento) => {
                    refs.current.numeroTarjeta = elemento;
                  }}
                />
                {/* La franquicia detectada se muestra como texto (no solo color)
                    para que también la perciba quien no distingue los logos. */}
                {NOMBRE_MARCA[marca] && (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-carbon-100 px-2.5 py-1 text-[11px] font-black uppercase text-carbon-600">
                    {NOMBRE_MARCA[marca]}
                  </span>
                )}
              </div>
              {errores.numeroTarjeta && (
                <p id="error-tarjeta" role="alert" className="error-campo">
                  <IconoCruz className="mt-0.5 h-3 w-3 shrink-0" />
                  {errores.numeroTarjeta}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="vencimiento" className="etiqueta">
                Vence (MM/AA)
              </label>
              <input
                id="vencimiento"
                name="vencimiento"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                maxLength={5}
                className="campo numeros-tabulares"
                placeholder="12/29"
                value={campos.vencimiento}
                onChange={(evento) =>
                  actualizar('vencimiento', formatearVencimiento(evento.target.value))
                }
                aria-invalid={Boolean(errores.vencimiento)}
                aria-describedby={errores.vencimiento ? 'error-vencimiento' : undefined}
                ref={(elemento) => {
                  refs.current.vencimiento = elemento;
                }}
              />
              {errores.vencimiento && (
                <p id="error-vencimiento" role="alert" className="error-campo">
                  <IconoCruz className="mt-0.5 h-3 w-3 shrink-0" />
                  {errores.vencimiento}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cvc" className="etiqueta">
                Código de seguridad
              </label>
              <input
                id="cvc"
                name="cvc"
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={largoCvc(marca)}
                className="campo numeros-tabulares"
                placeholder={marca === 'AMEX' ? '1234' : '123'}
                value={campos.cvc}
                onChange={(evento) => actualizar('cvc', soloDigitos(evento.target.value))}
                aria-invalid={Boolean(errores.cvc)}
                aria-describedby={errores.cvc ? 'error-cvc' : 'ayuda-cvc'}
                ref={(elemento) => {
                  refs.current.cvc = elemento;
                }}
              />
              {errores.cvc ? (
                <p id="error-cvc" role="alert" className="error-campo">
                  <IconoCruz className="mt-0.5 h-3 w-3 shrink-0" />
                  {errores.cvc}
                </p>
              ) : (
                <p id="ayuda-cvc" className="ayuda-campo">
                  {marca === 'AMEX' ? 'Los 4 números del frente.' : 'Los 3 números de atrás.'}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="cuotas" className="etiqueta">
                Número de cuotas
              </label>
              <select
                id="cuotas"
                name="cuotas"
                className="campo numeros-tabulares"
                value={campos.cuotas}
                onChange={(evento) => actualizar('cuotas', evento.target.value)}
                aria-describedby="ayuda-cuotas"
              >
                {CUOTAS_DISPONIBLES.map((cuota) => (
                  <option key={cuota} value={String(cuota)}>
                    {cuota === 1 ? 'Un solo pago' : `${cuota} cuotas`}
                  </option>
                ))}
              </select>
              <p id="ayuda-cuotas" className="ayuda-campo">
                {campos.cuotas === '1'
                  ? 'Débito o crédito en un solo pago.'
                  : `Aprox. ${formatCOP(Math.round(plan.precio / Number(campos.cuotas)))} por cuota, sin contar los intereses que cobre tu banco.`}
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------ autorización */}
          <div className="mt-7 rounded-2xl border border-masa-200 bg-masa-50 p-4">
            <label htmlFor="acepta" className="flex cursor-pointer items-start gap-3">
              <input
                id="acepta"
                name="acepta"
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-2 border-masa-400 accent-tomate-500"
                checked={campos.acepta}
                onChange={(evento) => actualizar('acepta', evento.target.checked)}
                aria-invalid={Boolean(errores.acepta)}
                aria-describedby={errores.acepta ? 'error-acepta' : undefined}
                ref={(elemento) => {
                  refs.current.acepta = elemento;
                }}
              />
              <span className="text-sm leading-relaxed text-carbon-600">
                Acepto los términos y condiciones de la pasarela de pagos y autorizo el tratamiento
                de mis datos personales para recibir el acceso al curso.
              </span>
            </label>
            {errores.acepta && (
              <p id="error-acepta" role="alert" className="error-campo">
                <IconoCruz className="mt-0.5 h-3 w-3 shrink-0" />
                {errores.acepta}
              </p>
            )}
          </div>

          <button type="submit" className="boton-primario mt-6 w-full text-[1.05rem]">
            {procesando ? (
              <>
                {/* El spinner también respeta prefers-reduced-motion: la clase
                    animate-spin queda anulada por el bloque global de CSS. */}
                <span
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white"
                />
                Procesando…
              </>
            ) : (
              <>
                <IconoCandado className="h-4 w-4" />
                Pagar {formatCOP(plan.precio)} COP
                <IconoFlecha className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-carbon-400">
            <IconoEscudo className="h-3.5 w-3.5 shrink-0 text-albahaca-600" />
            Procesado por Wompi. No guardamos los datos de tu tarjeta.
          </p>
        </fieldset>

        {/* Región viva: anuncia el avance del pago sin robar el foco. Con
            aria-live="polite" el lector de pantalla lo lee cuando termina lo
            que estaba diciendo, en vez de interrumpir. */}
        <div aria-live="polite" className="min-h-[1.5rem]">
          {procesando && mensaje && (
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-mostaza-50 p-4 text-sm font-semibold text-mostaza-800">
              <IconoTemporizador className="mt-0.5 h-4 w-4 shrink-0" />
              {mensaje}
              {etapa === 'esperando' && (
                <span className="numeros-tabulares ml-auto shrink-0 text-xs text-mostaza-600">
                  {intentos * Math.round(INTERVALO_POLLING / 1000)} s
                </span>
              )}
            </p>
          )}
        </div>

        {etapa === 'fallido' && (
          <div
            role="alert"
            className="mt-4 rounded-2xl border-2 border-tomate-300 bg-tomate-50 p-4"
          >
            <p className="text-sm font-bold text-tomate-700">{mensaje}</p>
            {referencia && (
              <p className="mt-1.5 font-mono text-xs text-tomate-600">Referencia: {referencia}</p>
            )}
            <button
              type="button"
              onClick={() => {
                // Se limpian solo los datos de la tarjeta: reescribir nombre,
                // correo y documento por un rechazo del banco es un castigo
                // innecesario.
                setCampos((previos) => ({
                  ...previos,
                  numeroTarjeta: '',
                  vencimiento: '',
                  cvc: '',
                }));
                setTransaccionId(null);
                setIntentos(0);
                setEtapa('formulario');
                setMensaje('');
              }}
              className="boton-secundario mt-4 py-2.5 text-sm"
            >
              Intentar con otra tarjeta
            </button>
          </div>
        )}
      </form>

      {/* ------------------------------------------------------------ columna 2 */}
      <aside className="lg:sticky lg:top-28">
        <div className="tarjeta bg-masa-50">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-carbon-500">
            Tu inscripción
          </h2>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-black text-carbon-800">Plan {plan.nombre}</p>
              <p className="mt-0.5 text-sm text-tomate-600">{plan.lema}</p>
            </div>
            <span className="chip shrink-0">
              <IconoTarjeta className="h-3.5 w-3.5 text-tomate-500" />
              Pago único
            </span>
          </div>

          <ul className="mt-5 space-y-2.5 border-t border-dashed border-masa-300 pt-5">
            {plan.beneficios.map((beneficio) => (
              <li key={beneficio} className="flex gap-2.5 text-sm leading-snug text-carbon-700">
                <span className="vineta-check">
                  <IconoCheck className="h-3 w-3" />
                </span>
                {beneficio}
              </li>
            ))}
          </ul>

          <div className="numeros-tabulares mt-6 border-t-2 border-carbon-800 pt-4">
            <div className="flex items-end justify-between gap-3">
              <span className="text-sm font-bold text-carbon-600">Total a pagar</span>
              <span className="text-3xl font-black leading-none text-carbon-800">
                {formatCOP(plan.precio)}
              </span>
            </div>
            <p className="mt-1 text-right text-xs font-bold text-carbon-400">Pesos colombianos</p>
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-albahaca-50 p-3.5 text-xs leading-relaxed text-albahaca-800">
            <IconoSobre className="mt-0.5 h-4 w-4 shrink-0" />
            Al aprobarse el pago te llega el acceso al correo, normalmente en menos de un minuto.
          </p>

          <Link
            href="/#planes"
            className="mt-4 block text-center text-sm font-bold text-carbon-500 underline decoration-masa-400 underline-offset-2 hover:text-tomate-600"
          >
            Cambiar de plan
          </Link>
        </div>
      </aside>
    </div>
  );
}
