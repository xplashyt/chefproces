# Sazón Propio 🍳

Sitio web de **membresía para aprender a cocinar desde cero**, dirigido a mujeres
que quieren cocinar bien y, si se animan, **cobrar por lo que cocinan**.

Cobro real con **Wompi** (tarjeta débito/crédito, hasta 36 cuotas) y entrega
automática del acceso por correo con **Resend**. Todo en español de Colombia.

---

## Índice

1. [Qué hay aquí](#1-qué-hay-aquí)
2. [Requisitos](#2-requisitos)
3. [Cómo correrlo (paso a paso)](#3-cómo-correrlo-paso-a-paso)
4. [Las 8 variables de entorno](#4-las-8-variables-de-entorno)
5. [Los planes y los precios](#5-los-planes-y-los-precios)
6. [Cómo funciona el pago, de principio a fin](#6-cómo-funciona-el-pago-de-principio-a-fin)
7. [Probar el pago en sandbox](#7-probar-el-pago-en-sandbox)
8. [Configurar el webhook](#8-configurar-el-webhook)
9. [Pasar a producción](#9-pasar-a-producción)
10. [Decisiones técnicas y por qué](#10-decisiones-técnicas-y-por-qué)
11. [Qué debes personalizar antes de publicar](#11-qué-debes-personalizar-antes-de-publicar)
12. [Problemas frecuentes](#12-problemas-frecuentes)

---

## 1. Qué hay aquí

| Ruta                        | Qué es                                                        |
| --------------------------- | ------------------------------------------------------------- |
| `/`                         | Landing completa. HTML de servidor, **175 B de JS propio**.   |
| `/checkout?plan=basico`     | Formulario de pago. El único lugar con JavaScript.            |
| `/api/wompi/acceptance`     | Trae los contratos (permalinks) que la usuaria debe aceptar.  |
| `/api/wompi/pay`            | Crea la transacción: pone el monto y la firma de integridad.  |
| `/api/wompi/status/[id]`    | Consulta de estado para el polling del checkout.              |
| `/api/wompi/webhook`        | Recibe el evento de Wompi, lo verifica y entrega el acceso.   |

Estructura:

```
app/
  layout.tsx                 metadatos, lang="es-CO", estilos globales
  page.tsx                   landing (100 % componentes de servidor)
  globals.css                sistema visual (azulejo, papel de receta, campos)
  checkout/page.tsx          lee ?plan= en el SERVIDOR y monta el panel
  api/wompi/
    pay/route.ts             crea la transacción (llave privada + firma)
    status/[id]/route.ts     consulta de estado para el polling
    webhook/route.ts         verifica el evento y entrega el acceso
    acceptance/route.ts      permalinks de los contratos de Wompi
components/
  Icons.tsx                  30+ iconos de cocina y el logo, en SVG inline
  landing/                   Nav, Hero, Incluye, Temario, Planes,
                             Confianza, Preguntas, CtaFinal, Footer
  checkout/PanelCheckout.tsx formulario, tokenización y polling (cliente)
lib/
  plans.ts                   ÚNICA fuente de verdad de precios + formatCOP
  reference.ts               construye y parsea la referencia (isomorfo)
  wompi-endpoint.ts          sandbox vs producción (sin imports)
  wompi-browser.ts           tokenización de tarjeta (navegador)
  wompi-server.ts            firma, transacción, estado, firma de eventos
  payment-options.ts         cuotas y validadores compartidos
  card.ts                    Luhn, marca, vencimiento (solo navegador)
  server-env.ts              lectura validada de variables de entorno
  email.ts                   los dos correos con Resend
```

Stack fijo: **Next.js 14.2.35 (App Router) · TypeScript 5.5.3 · Tailwind CSS
3.4.4 · React 18.3.1 · resend 4.5.1**. Sin base de datos, sin librerías de
iconos, sin Google Fonts, sin imágenes externas: **cero peticiones a terceros**.

---

## 2. Requisitos

- **Node.js 18.17 o superior** (`node -v` para comprobarlo).
- Una cuenta de **Wompi** → https://comercios.wompi.co (llaves de prueba gratis).
- Una cuenta de **Resend** → https://resend.com (plan gratis: 3.000 correos/mes).

---

## 3. Cómo correrlo (paso a paso)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear tu archivo de variables (Windows PowerShell)
Copy-Item .env.example .env.local
#    En macOS o Linux:  cp .env.example .env.local

# 3. Abrir .env.local y pegar tus llaves de prueba de Wompi y Resend
#    (ver la sección 4)

# 4. Levantar el sitio
npm run dev
```

Abre **http://localhost:3000**.

Otros comandos:

```bash
npm run build      # compila para producción
npm start          # sirve el build (requiere npm run build antes)
npm run lint       # ESLint con la config de Next
npm run typecheck  # tsc --noEmit, sin emitir archivos
```

> El sitio **arranca y se ve completo sin ninguna variable de entorno**. Las
> variables solo hacen falta para cobrar de verdad: si intentas pagar sin
> configurarlas, `/api/wompi/pay` responde un mensaje claro en vez de reventar.

---

## 4. Las 8 variables de entorno

Todas van en `.env.local` (que **nunca** se sube al repositorio).

| Variable                        | Dónde se usa | Para qué                                                                 |
| ------------------------------- | ------------ | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`  | Navegador    | Tokenizar la tarjeta. Es la única llave que puede viajar al cliente.     |
| `WOMPI_PRIVATE_KEY`             | Servidor     | Crear y consultar transacciones.                                        |
| `WOMPI_INTEGRITY_SECRET`        | Servidor     | Firmar `referencia + monto + moneda`. Impide que se manipule el precio.  |
| `WOMPI_EVENTS_SECRET`           | Servidor     | Verificar el checksum del webhook. Impide accesos regalados.            |
| `RESEND_API_KEY`                | Servidor     | Enviar los correos.                                                     |
| `EMAIL_FROM`                    | Servidor     | Remitente verificado en Resend, ej. `Sazón Propio <hola@tudominio.com>`. |
| `EMAIL_SOPORTE`                 | Servidor     | Correo interno que recibe el aviso de cada venta.                        |
| `URL_ACCESO_AULA`               | Servidor     | Enlace real del aula que se pega en el correo de bienvenida.             |

**Dónde encontrar las llaves de Wompi:** panel de comercios → *Desarrolladores*.
Ahí están las cuatro (pública, privada, integridad y eventos), en versión de
prueba (`pub_test_…`, `prv_test_…`) y de producción.

**El ambiente se deduce del prefijo de la llave.** No hay una variable
`WOMPI_ENV`: si tu llave empieza por `pub_test_`, el sitio habla con el sandbox;
si empieza por `pub_prod_`, con producción. Así es imposible desplegar apuntando
al ambiente equivocado.

---

## 5. Los planes y los precios

Los precios están en **un solo archivo**: `lib/plans.ts`.

| Plan       | Precio          | Para quién                                         |
| ---------- | --------------- | -------------------------------------------------- |
| Esencial   | **$48.900 COP** | Arranca de cero, cocina para su casa.              |
| Básico     | **$69.900 COP** | Programa completo. Es el destacado.                |
| Avanzado   | **$89.900 COP** | Incluye los módulos para vender y cobrar.          |

Todos son **pago único**. En el sitio no existe ningún otro precio: no hay
precios tachados ni "antes de".

Para cambiar un precio, edita `precio` en `lib/plans.ts` y ya: la landing, la
tabla comparativa, el checkout, el monto que se cobra y los correos se
actualizan solos. Para quitar o agregar un plan, borra o añade un objeto del
arreglo `PLANES` (si quitas el destacado, pon `destacado: true` en otro).

---

## 6. Cómo funciona el pago, de principio a fin

```
1. La usuaria hace clic en un plan  →  /checkout?plan=basico
   El SERVIDOR lee y valida ?plan= y monta el panel con el plan real.

2. Llena el formulario y envía.
   El navegador pide los contratos a /api/wompi/acceptance.

3. TOKENIZACIÓN (navegador → Wompi, directo)
   El número y el CVC van cifrados a Wompi con la llave pública.
   Nuestro servidor NUNCA los ve. Recibimos solo un token opaco.

4. POST /api/wompi/pay  (navegador → nuestro servidor)
   Se envía: id del plan, token de la tarjeta, cuotas y datos de contacto.
   NO se envía el monto.
   El servidor:
     · busca el precio en lib/plans.ts,
     · construye la referencia (que lleva el plan dentro),
     · firma SHA-256(referencia + monto + moneda + secreto de integridad),
     · crea la transacción en Wompi con la llave privada.

5. POLLING  →  GET /api/wompi/status/{id} cada 3,5 s (máx. ~2 min)
   Con tarjeta, Wompi responde PENDING y resuelve segundos después.

6. ENTREGA DEL ACCESO (dos caminos, uno de respaldo del otro)
     · POST /api/wompi/webhook  ← el camino oficial. Verifica el checksum
       del evento, comprueba que el monto coincida con el precio real y envía
       los correos.
     · el polling de /status también entrega si ve APPROVED, porque en
       localhost el webhook no puede llegar.
   La entrega es idempotente: no se manda el correo dos veces.

7. Resend envía dos correos: el acceso a la alumna y el aviso al equipo.
```

**Por qué el monto lo pone el servidor:** si el navegador enviara el precio,
cualquiera podría abrir la consola y pagar $1.000 por el plan de $89.900. Como el
monto sale de `lib/plans.ts` y va firmado con el secreto de integridad, Wompi
rechaza cualquier intento de alterarlo.

**Por qué la referencia se parsea desde la derecha:** la referencia es el único
hilo entre la transacción y el plan (no hay base de datos). Se ve así:

```
sazon-propio-basico-lz4k9x1-h7f2qa
└── prefijo ──┘ └plan┘ └tiempo┘ └azar┘
```

El prefijo puede cambiar mañana a `sazon-propio-black-friday` y contener
guiones. Los **tres últimos** segmentos, en cambio, siempre son plan, marca de
tiempo y aleatorio. Leyendo desde el final, el formato aguanta cambios de prefijo
sin migraciones ni referencias viejas rotas.

---

## 7. Probar el pago en sandbox

Con las llaves `pub_test_…` / `prv_test_…` puestas, entra a `/checkout` y usa las
tarjetas de prueba de Wompi:

| Tarjeta                 | Resultado esperado |
| ----------------------- | ------------------ |
| `4242 4242 4242 4242`   | **APPROVED**       |
| `4111 1111 1111 1111`   | **DECLINED**       |

Cualquier fecha futura (`12/29`) y cualquier CVC (`123`). Documento y celular:
inventados pero con formato válido (celular de 10 dígitos que empiece por 3).

> Si Wompi cambia sus tarjetas de prueba, la lista vigente está en su
> documentación (*Sandbox / Datos de prueba*).

Para ver el correo real en la prueba necesitas una `RESEND_API_KEY` válida. Con
la cuenta gratis de Resend puedes usar `onboarding@resend.dev` como `EMAIL_FROM`
mientras no tengas dominio verificado, pero solo podrás enviarte correos **a ti
misma** (a la dirección de la cuenta).

---

## 8. Configurar el webhook

En el panel de Wompi → *Desarrolladores* → **URL de eventos**:

```
https://TU-DOMINIO.com/api/wompi/webhook
```

En `localhost` Wompi no puede alcanzarte. Dos opciones:

- **No hacer nada**: el polling del checkout entrega el acceso igual mientras la
  página siga abierta. Suficiente para desarrollar.
- **Túnel** (para probar el webhook de verdad):

  ```bash
  npx localtunnel --port 3000
  # o: ngrok http 3000
  ```

  y registra `https://algo.loca.lt/api/wompi/webhook` como URL de eventos.

El webhook **siempre responde 200** cuando el evento es legítimo, incluso si el
correo falló: si respondiera error, Wompi reintentaría el evento en bucle. Los
fallos de correo quedan en el log del servidor.

---

## 9. Pasar a producción

1. Cambia las cuatro llaves de Wompi por las de producción (`pub_prod_…`,
   `prv_prod_…` y sus dos secretos). No hay nada más que cambiar: el endpoint se
   deduce del prefijo.
2. Verifica tu dominio en Resend y pon un `EMAIL_FROM` de ese dominio.
3. Pon el `URL_ACCESO_AULA` definitivo.
4. Registra la URL de eventos con tu dominio real (sección 8).
5. Despliega:

   ```bash
   npm run build
   npm start
   ```

   En **Vercel**: importa el repo, pega las 8 variables en *Settings →
   Environment Variables* y despliega. No requiere configuración extra.

6. Haz **una compra real de prueba** con tu propia tarjeta (el plan Esencial) y
   confirma que llega el correo. Después pide el reverso desde el panel de Wompi.

---

## 10. Decisiones técnicas y por qué

**La landing es 100 % componentes de servidor.** No hay un solo `'use client'` en
la página de inicio, así que llega como HTML y el navegador no descarga ni
ejecuta JavaScript **nuestro** para mostrarla: el build reporta **175 B** de JS
propio para `/` (el resto de los 96 kB es el runtime del App Router, que Next
carga siempre y no depende de nosotros). En un país donde mucha gente entra con
datos móviles, eso es la diferencia entre ver el precio en 1 segundo o en 6.

**Las preguntas frecuentes usan `<details>`/`<summary>` nativos.** El navegador
ya sabe abrir y cerrar: funciona con teclado (Enter/Espacio), el lector de
pantalla anuncia "expandido/contraído" sin `aria-expanded`, `Ctrl+F` encuentra el
texto de las respuestas cerradas y cuesta **0 KB**. Un acordeón en React
necesitaría estado, manejo de teclado y ARIA para hacer lo mismo, peor. El menú
móvil de la barra usa el mismo truco.

**`lib/wompi-endpoint.ts` está solo y sin imports.** Lo necesitan el navegador y
el servidor. Si viviera dentro de `wompi-server.ts`, importarlo desde el cliente
arrastraría `node:crypto` al bundle y el build fallaría.

**Todo el arte es CSS y SVG inline.** El azulejo de la cocina, el papel de receta
con renglones, la veta de madera del pie, el vapor de la olla y las frutas que
flotan son gradientes y `keyframes`. Sin imágenes no hay peticiones a terceros y,
sobre todo, **no hay saltos de layout**: nada aparece tarde y empuja el
contenido. Los iconos son SVG a mano (no una librería) porque pintan con
`currentColor`, escalan sin borrosidad y no traen 400 iconos que no se usan.

**La firma de eventos se compara en tiempo constante** (`timingSafeEqual`).
Comparar hashes con `===` filtra información por el tiempo de respuesta y
permitiría adivinar el checksum byte a byte.

**No hay base de datos, a propósito.** La referencia lleva el plan dentro, así
que el webhook sabe qué entregar con solo leerla. La idempotencia de los correos
se resuelve con un `Set` en memoria: en el peor caso (reinicio del servidor o
varias instancias) la alumna recibe el correo dos veces, lo cual es molesto pero
mucho mejor que no recibirlo.

**Accesibilidad, concreta y no decorativa:** `<html lang="es-CO">`,
`:focus-visible` visible en todo el sitio, `aria-hidden` en cada icono
decorativo, `role="alert"` en los errores, `aria-invalid` atado al estilo del
campo (el CSS reacciona al atributo, así que el color y lo que anuncia el lector
de pantalla no se pueden desincronizar), el foco salta al primer campo con error,
`aria-live="polite"` para el avance del pago y un bloque
`@media (prefers-reduced-motion: reduce)` que apaga **todas** las animaciones,
incluido el vapor y el spinner.

**Números con `font-variant-numeric: tabular-nums`** (utilidad
`.numeros-tabulares`) en precios, tabla comparativa y contadores: sin eso, las
cifras cambian de ancho y las columnas "bailan" al compararlas.

---

## 11. Qué debes personalizar antes de publicar

- [ ] **Testimonios** (`components/landing/Confianza.tsx`): son plantillas con
      "Nombre de la alumna". Reemplázalos por reseñas reales con permiso.
      Publicar testimonios inventados como reales es publicidad engañosa y en
      Colombia lo sanciona la SIC.
- [ ] **Cifras del hero** (`components/landing/Hero.tsx`): "1.842 alumnas la
      hicieron" y las estadísticas deben reflejar tus números reales.
- [ ] **Temario** (`components/landing/Temario.tsx`): cantidad de clases y
      minutos por módulo.
- [ ] **Contacto**: `hola@sazonpropio.co` y el WhatsApp `573000000000` aparecen
      en `Footer.tsx` y `Preguntas.tsx`.
- [ ] **Nombre de la marca** si no vas a usar "Sazón Propio" (`layout.tsx`,
      `Nav.tsx`, `Footer.tsx`, `lib/email.ts`).
- [ ] **Páginas legales**: términos y política de datos personales propias (la
      Ley 1581 de 2012 las exige si tratas datos).

---

## 12. Problemas frecuentes

**"Falta la variable de entorno X"** → No copiaste `.env.example` a `.env.local`,
o guardaste el archivo y no reiniciaste `npm run dev`. Next lee las variables al
arrancar.

**El pago queda PENDING para siempre** → Normal en sandbox con algunas tarjetas.
El polling se rinde a los ~2 minutos con un mensaje claro. Consulta el estado
real en el panel de Wompi con la referencia.

**No llega el correo** → Tres causas, en orden de probabilidad: (1) `EMAIL_FROM`
no es de un dominio verificado en Resend; (2) con la cuenta gratis y
`onboarding@resend.dev` solo puedes enviarte correos a ti misma; (3) cayó en
spam. El error exacto queda en la consola del servidor con el prefijo
`[resend]`.

**"Firma inválida" (401) en el webhook** → `WOMPI_EVENTS_SECRET` es de otro
ambiente (mezclaste el de prueba con producción) o tiene un espacio al pegarlo.
Si en cambio responde **500 "Webhook mal configurado"**, la variable no existe:
ese 500 es intencional para que Wompi reintente el evento cuando la arregles, en
vez de descartar la venta.

**"No pudimos validar la tarjeta" siempre, incluso con la tarjeta de prueba** →
Puede ser el host del sandbox. En `lib/wompi-endpoint.ts` está
`https://api-sandbox.co.uat.wompi.dev/v1`, que es el sandbox actual de Wompi;
algunas cuentas antiguas siguen usando `https://sandbox.wompi.co/v1`. Compara con
la URL base que muestre tu panel y cambia esa constante si no coincide (es el
único lugar donde vive).

**El build falla con `node:crypto`** → Algo importó `lib/wompi-server.ts` desde un
componente cliente. Ese archivo tiene `import 'server-only'` justamente para que
el error aparezca en el build y no en producción: mueve la lógica a una ruta de
API.

**Los estilos no se aplican** → Revisa que el archivo esté dentro de `app/`,
`components/` o `lib/`: son las únicas rutas en `content` de
`tailwind.config.ts`.

---

Hecho con Next.js, sin dependencias de más. 🍅
