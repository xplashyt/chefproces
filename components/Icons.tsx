/**
 * Iconografía completa en SVG inline.
 *
 * ¿Por qué a mano y no una librería de iconos? Porque una librería trae cientos
 * de iconos que no usamos (peso muerto en el bundle o un componente cliente
 * innecesario), y porque estos son de cocina: tomates, ollas, cucharas. Al ser
 * SVG inline se pintan con `currentColor`, escalan sin borrosidad y no generan
 * ni una petición de red.
 *
 * Todos llevan `aria-hidden="true"` y `focusable="false"`: son decorativos. El
 * significado siempre está en el texto que acompaña, nunca en el dibujo.
 */

export interface PropsIcono {
  className?: string;
}

/** Props comunes: evita repetir aria-hidden en 30 lugares y olvidarlo en uno. */
const base = {
  'aria-hidden': true as const,
  focusable: 'false' as const,
  xmlns: 'http://www.w3.org/2000/svg',
};

/* ---------------------------------------------------------------- marca */

/** Logo: gorro de chef sobre un plato, dentro de un círculo de tomate. */
export function Logo({ className = 'h-10 w-10' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 48 48" className={className}>
      <circle cx="24" cy="24" r="23" fill="#d93a28" />
      <circle cx="24" cy="24" r="19.5" fill="none" stroke="#ffdd84" strokeWidth="1.4" strokeDasharray="3 3" />
      <path
        d="M15 26c-2.6-.6-4.4-2.9-4.4-5.6 0-3.2 2.6-5.8 5.8-5.8.6 0 1.2.1 1.7.3C19 12.7 21.3 11 24 11s5 1.7 5.9 4c.5-.2 1.1-.3 1.7-.3 3.2 0 5.8 2.6 5.8 5.8 0 2.7-1.8 5-4.4 5.6z"
        fill="#fff8ec"
      />
      <path d="M15 27.5h18v3.2a1.6 1.6 0 0 1-1.6 1.6H16.6A1.6 1.6 0 0 1 15 30.7z" fill="#fbeed8" />
      <path d="M13.5 35.5h21" stroke="#ffdd84" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------------------------------------------------------- utensilios */

export function IconoCuchillo({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M3 14.5 15 2.5c.7 2.6.4 5.6-1.6 8.2-1.9 2.5-4.6 3.7-7 3.8z" fill="currentColor" opacity=".9" />
      <path d="m13.8 15.3 5.4 5.4a1.7 1.7 0 0 0 2.4-2.4l-5.4-5.4z" fill="currentColor" />
      <path d="m11.6 13.1 2.2 2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconoCucharon({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path
        d="M15.5 2.5c3 0 5.4 2.4 5.4 5.4s-2.4 5.4-5.4 5.4S10 10.9 10 7.9s2.5-5.4 5.5-5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path d="M12.2 12.4 4.8 20a1.9 1.9 0 1 1-2.7-2.7l7.5-7.4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function IconoBatidora({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M4 4h11a3 3 0 0 1 3 3v2H4z" fill="currentColor" opacity=".85" />
      <path d="M7 10v5c0 1.6 1.3 2.9 2.9 2.9M12 10v5c0 1.6 1.3 2.9 2.9 2.9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17.5 9.5V6h3.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 20.5h11" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function IconoBalanza({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <rect x="2.5" y="13" width="19" height="8.5" rx="2.4" fill="currentColor" opacity=".85" />
      <path d="M8 13V9.5A4 4 0 0 1 16 9.5V13" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="17.2" r="2.2" fill="#fff8ec" />
      <path d="M12 16v1.2l.9.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Olla con vapor. El vapor se anima aparte para poder apagarlo con
 *  prefers-reduced-motion (clase .vapor-humo). */
export function IconoOlla({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <g className="vapor-humo" opacity=".7">
        <path d="M9 6c-1.2-1.1-.6-2.3.4-3.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M12.4 5.6c-1.3-1.4-.5-2.7.6-3.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M15.6 6c-1.1-1.1-.6-2.2.3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <path d="M3.5 9h17v6.5a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4z" fill="currentColor" opacity=".9" />
      <path d="M2 8h20a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2z" fill="currentColor" />
      <path d="M1.4 11.5h1.8M20.8 11.5h1.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function IconoSarten({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <ellipse cx="10" cy="14" rx="7.5" ry="5.5" fill="currentColor" opacity=".9" />
      <ellipse cx="10" cy="12.6" rx="7.5" ry="4.6" fill="currentColor" />
      <path d="M17.6 12.2 22 9.4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

export function IconoTemporizador({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="13.6" r="8.4" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M12 9.4v4.2l2.8 1.8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M9.4 2.5h5.2M12 2.5v2.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function IconoLibro({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M3.5 4.5A2 2 0 0 1 5.5 2.5H19a1.5 1.5 0 0 1 1.5 1.5v14A1.5 1.5 0 0 1 19 19.5H5.5a2 2 0 0 0-2 2z" fill="currentColor" opacity=".9" />
      <path d="M7.5 7h8M7.5 10.5h8M7.5 14h5" stroke="#fff8ec" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconoGorroChef({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path
        d="M7 14c-2.5-.5-4.3-2.7-4.3-5.3C2.7 5.6 5.3 3 8.5 3c.5 0 1 .1 1.5.2C10.8 1.9 12.3 1 14 1c2.8 0 5 2.2 5 5 0 .2 0 .4-.1.6 1.5.8 2.4 2.3 2.4 4.1 0 1.7-1.3 3.1-3.3 3.3z"
        fill="currentColor"
        opacity=".9"
      />
      <path d="M7 15.5h11v4.4a1.6 1.6 0 0 1-1.6 1.6H8.6A1.6 1.6 0 0 1 7 19.9z" fill="currentColor" />
      <path d="M7.5 18.5h10" stroke="#fff8ec" strokeWidth="1.4" />
    </svg>
  );
}

/* ---------------------------------------------------------------- frutas y verduras */

export function IconoTomate({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="14.4" r="7.6" fill="#e04a33" />
      <path d="M12 7.6a7.6 7.6 0 0 0-6.6 3.9c1.6 1.1 4 1.8 6.6 1.8s5-.7 6.6-1.8A7.6 7.6 0 0 0 12 7.6" fill="#f0603f" opacity=".55" />
      <path
        d="M12 8.2c-.6-1-1.8-1.5-3-1.3.4-1 1.3-1.7 2.4-1.8-1-.7-2.3-.8-3.4-.2.7-1.2 2.1-1.9 3.5-1.7 1-.9 2.6-1 3.7-.2-1 .3-1.7 1-2 2 1.3-.4 2.7.1 3.4 1.2-1.2-.2-2.4.1-3.2.9.9.3 1.6 1 1.9 1.9-1-.6-2.2-.7-3.3-.2z"
        fill="#41ab68"
      />
      <ellipse cx="9.4" cy="12.8" rx="1.5" ry="2.1" fill="#fff" opacity=".3" />
    </svg>
  );
}

export function IconoLimon({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <ellipse cx="12" cy="12.6" rx="9" ry="7" transform="rotate(-24 12 12.6)" fill="#fbc94a" />
      <ellipse cx="12" cy="12.6" rx="6.4" ry="4.6" transform="rotate(-24 12 12.6)" fill="#ffdd84" opacity=".7" />
      <path d="M20.4 6.6c.9-.9 1.6-1.3 2.2-1.3-.2.7-.7 1.4-1.6 2.2z" fill="#41ab68" />
      <path d="M8 15.6c1.4-2.6 3.6-4.5 6.4-5.6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".55" fill="none" />
    </svg>
  );
}

export function IconoAguacate({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2.2c3.5 0 6.4 2.6 6.4 6 0 2.1-.8 3.3-1.4 4.6-.8 1.7-.6 4-1.9 5.9-1 1.5-2.5 2.5-4.3 2.5-3.2 0-5.8-3-5.8-6.6 0-2.2.9-3.6 1.5-5.1C7.4 7.6 7 5.9 8.2 4.2 9.1 3 10.4 2.2 12 2.2"
        fill="#1f6f40"
      />
      <path
        d="M12 5c2.4 0 4.3 1.8 4.3 4.2 0 1.5-.6 2.3-1 3.2-.6 1.3-.4 2.9-1.3 4.2-.7 1-1.7 1.7-3 1.7-2.2 0-4-2.1-4-4.7 0-1.5.6-2.5 1-3.6.4-1.2.2-2.4 1-3.6C10.6 5.6 11 5 12 5"
        fill="#a6e2ba"
      />
      <circle cx="12" cy="14.4" r="2.9" fill="#946743" />
    </svg>
  );
}

export function IconoChile({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path
        d="M13.6 5.4c2.6.9 4.6 3.4 4.6 6.6 0 4.4-3.6 8-8 8-2.8 0-5.2-1.4-6.6-3.6 3.2 1 6.6-.2 8.4-2.9 1.4-2 1.8-5 1.6-8.1"
        fill="#d93a28"
      />
      <path d="M13.6 5.4c-.2-1.5.6-2.7 2-3.3.3 1.2 0 2.3-.7 3.1 1.2-.5 2.5-.2 3.4.7-1.3.4-2.2 1.2-2.6 2.3z" fill="#2b8c50" />
    </svg>
  );
}

export function IconoZanahoria({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M15.6 8.4 6.8 17.2a2.4 2.4 0 0 0-.6 1l-.9 3.1c-.2.7.4 1.3 1.1 1.1l3.1-.9c.4-.1.7-.3 1-.6l8.8-8.8z" fill="#f1b01f" />
      <path d="m9.4 14.6 1.8 1.8m-4 .2 1.8 1.8m4.6-6.4 1.8 1.8" stroke="#ac7008" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M16.6 7.4c-.6-1.6.2-3.2 1.8-4 .3 1.2 0 2.2-.6 3 1.2-1 2.9-1.1 4.2-.2-1.4.6-2.2 1.6-2.4 2.8 1.3-.3 2.5.1 3.2 1-1.6.1-2.8.7-3.6 1.8z" fill="#2b8c50" />
    </svg>
  );
}

export function IconoHuevo({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path
        d="M6.8 12.6c-1.9-.6-3.9.3-4.3 1.9-.5 1.9 1.3 3.4 3.3 3.1-1 1.4.1 3.1 2 3.1 1.3 0 2-.6 2.6-1.4.7 1.2 2.2 1.9 3.7 1.5 1.6-.4 2.5-1.7 2.4-3 1.7.5 3.4-.4 3.8-1.9.4-1.6-.6-3-2.3-3.3 1.2-1.2 1-3-.5-3.9-1.1-.6-2.3-.5-3.2.1.1-1.9-1.4-3.5-3.4-3.5-1.9 0-3.4 1.5-3.4 3.4-1.4-.7-3-.3-3.8.9-.8 1.2-.4 2.7.8 3.4"
        fill="#fffdf8"
        stroke="#f3ddbd"
        strokeWidth="1"
      />
      <circle cx="12.2" cy="12.8" r="3.9" fill="#f1b01f" />
      <circle cx="10.9" cy="11.5" r="1.2" fill="#ffdd84" opacity=".8" />
    </svg>
  );
}

export function IconoAjo({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M12 4.5c1.2 1 1.8 2.4 1.8 4.2 2.4.9 4 3 4 5.6 0 3.2-2.6 5.7-5.8 5.7s-5.8-2.5-5.8-5.7c0-2.6 1.6-4.7 4-5.6 0-1.8.6-3.2 1.8-4.2" fill="#fbeed8" stroke="#e6c69b" strokeWidth="1" />
      <path d="M12 8.7v11.3M9 10.2c-.9 2.6-.8 6 .6 9.2M15 10.2c.9 2.6.8 6-.6 9.2" stroke="#e6c69b" strokeWidth="1" fill="none" />
      <path d="M12 4.5c0-1.2.8-2.2 2-2.5-.2 1.3-.8 2.2-2 2.5z" fill="#2b8c50" />
    </svg>
  );
}

export function IconoHoja({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M20.5 3.5C10 3.5 3.5 8.5 3.5 16c0 1.8.5 3.3 1.3 4.5C7.5 12.5 12.5 8.5 20.5 3.5" fill="currentColor" opacity=".35" />
      <path d="M20.5 3.5c1 8-3 16.5-11.5 16.5-1.6 0-3-.4-4.2-1.1C7.5 12.5 12.5 8.5 20.5 3.5" fill="currentColor" />
    </svg>
  );
}

/* ---------------------------------------------------------------- panadería */

export function IconoCupcake({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M5.6 11.5h12.8l-1.5 8.1a2 2 0 0 1-2 1.6H9.1a2 2 0 0 1-2-1.6z" fill="#e6c69b" />
      <path d="M9.4 11.5 10.4 21M14.6 11.5 13.6 21" stroke="#b78655" strokeWidth="1" />
      <path
        d="M7.4 11.5c-1.6 0-2.9-1.3-2.9-2.9 0-1.4 1-2.6 2.4-2.8.2-2 1.9-3.6 4-3.6 1.7 0 3.2 1 3.8 2.5.3-.1.6-.1.9-.1 1.8 0 3.2 1.4 3.2 3.2 0 2-1.6 3.7-3.6 3.7z"
        fill="#fb8f7e"
      />
      <circle cx="12" cy="3.4" r="1.5" fill="#d93a28" />
    </svg>
  );
}

export function IconoPan({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M3 12.5c0-3.9 4-7 9-7s9 3.1 9 7c0 1.3-1 2.4-2.3 2.4H5.3A2.3 2.3 0 0 1 3 12.5" fill="#d3a875" />
      <path d="M4.2 15h15.6l-1 3.6a2.4 2.4 0 0 1-2.3 1.8H7.5a2.4 2.4 0 0 1-2.3-1.8z" fill="#b78655" />
      <path d="M8.5 8.8c-.8 1-1.1 2.2-.9 3.4M12 8.4c-.6 1.1-.8 2.3-.5 3.6M15.5 8.8c.8 1 1.1 2.2.9 3.4" stroke="#946743" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function IconoTaza({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <g className="vapor-humo" opacity=".65">
        <path d="M9.5 5c-1.1-1-.6-2.1.3-2.9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M13.2 5c-1.1-1-.6-2.1.3-2.9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </g>
      <path d="M4 8.5h13v6.6a4.4 4.4 0 0 1-4.4 4.4H8.4A4.4 4.4 0 0 1 4 15.1z" fill="currentColor" opacity=".9" />
      <path d="M17 10.2h1.8a2.6 2.6 0 0 1 0 5.2H17" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 21.2h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconoPlato({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="9.2" fill="currentColor" opacity=".18" />
      <circle cx="12" cy="12" r="6.2" fill="currentColor" opacity=".35" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

/* ---------------------------------------------------------------- interfaz */

export function IconoFuego({ className = 'h-6 w-6' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M12 2c3.2 3.4 6.6 6 6.6 10.4 0 3.9-3 6.9-6.6 6.9s-6.6-3-6.6-6.9c0-2.4 1.2-4 2.6-5.6.2 1.6 1 2.6 2.2 2.9-.6-3 .4-5.5 1.8-7.7" fill="#f1b01f" />
      <path d="M12 11.4c1.6 1.7 3 3 3 5.1 0 1.9-1.4 3.3-3 3.3s-3-1.4-3-3.3c0-2.1 1.4-3.4 3-5.1" fill="#d93a28" />
    </svg>
  );
}

export function IconoCheck({ className = 'h-4 w-4' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="m4.5 12.8 5 5L19.5 6.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoCruz({ className = 'h-4 w-4' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconoEstrella({ className = 'h-4 w-4' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z" fill="currentColor" />
    </svg>
  );
}

export function IconoCandado({ className = 'h-5 w-5' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <rect x="4" y="10.5" width="16" height="11" rx="2.6" fill="currentColor" />
      <path d="M7.8 10.5V7.8a4.2 4.2 0 0 1 8.4 0v2.7" fill="none" stroke="currentColor" strokeWidth="2.1" />
      <circle cx="12" cy="15.6" r="1.6" fill="#fff8ec" />
    </svg>
  );
}

export function IconoEscudo({ className = 'h-5 w-5' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M12 2.2l7.8 3v6.3c0 4.7-3.2 8.9-7.8 10.3-4.6-1.4-7.8-5.6-7.8-10.3V5.2z" fill="currentColor" opacity=".9" />
      <path d="m8.4 12.2 2.6 2.6 4.8-4.8" fill="none" stroke="#fff8ec" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoTarjeta({ className = 'h-5 w-5' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.6" fill="currentColor" opacity=".9" />
      <path d="M2.5 9.5h19" stroke="#fff8ec" strokeWidth="2.4" />
      <path d="M5.8 15h4" stroke="#fff8ec" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconoSobre({ className = 'h-5 w-5' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.4" fill="currentColor" opacity=".9" />
      <path d="m3.5 6.5 8.5 6.4 8.5-6.4" fill="none" stroke="#fff8ec" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function IconoWhatsapp({ className = 'h-5 w-5' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2.5A9.4 9.4 0 0 0 3.9 16.7L2.6 21.4l4.8-1.3A9.4 9.4 0 1 0 12 2.5m0 1.9a7.5 7.5 0 0 1 3.9 13.9l-.5.3-3 .8.8-2.9-.3-.5A7.5 7.5 0 0 1 12 4.4"
        fill="currentColor"
      />
      <path
        d="M9.4 7.7c.2 0 .4 0 .6.4l.7 1.6c.1.2 0 .4-.1.5l-.5.6c-.1.2-.2.3 0 .6.4.6 1.3 1.6 2.4 2 .3.1.4.1.6-.1l.6-.7c.1-.2.3-.2.5-.1l1.6.8c.3.1.3.4.2.6-.2.7-1 1.4-1.8 1.4-1.6 0-3.6-1.4-4.7-2.7-.9-1-1.6-2.2-1.6-3.2 0-.9.6-1.8 1.3-2z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconoFlecha({ className = 'h-4 w-4' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoFlechaAbajo({ className = 'h-4 w-4' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M12 4.5v15m0 0 5.5-5.5M12 19.5 6.5 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoCorazon({ className = 'h-5 w-5' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" className={className}>
      <path d="M12 20.8S3.2 15.6 3.2 9.6C3.2 6.4 5.7 4 8.7 4c1.5 0 2.6.6 3.3 1.6C12.7 4.6 13.8 4 15.3 4c3 0 5.5 2.4 5.5 5.6 0 6-8.8 11.2-8.8 11.2" fill="currentColor" />
    </svg>
  );
}

/** Rueda de especias: adorno grande y giratorio para el fondo del hero. */
export function AdornoEspecias({ className = 'h-40 w-40' }: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 120 120" className={className}>
      <circle cx="60" cy="60" r="56" fill="none" stroke="#f1b01f" strokeWidth="1.4" strokeDasharray="5 7" opacity=".55" />
      <circle cx="60" cy="60" r="40" fill="none" stroke="#d93a28" strokeWidth="1.2" strokeDasharray="2 8" opacity=".45" />
      {[0, 60, 120, 180, 240, 300].map((angulo) => (
        <circle
          key={angulo}
          cx={60 + 48 * Math.cos((angulo * Math.PI) / 180)}
          cy={60 + 48 * Math.sin((angulo * Math.PI) / 180)}
          r="4.5"
          fill={angulo % 120 === 0 ? '#f1b01f' : '#d93a28'}
          opacity=".5"
        />
      ))}
    </svg>
  );
}
