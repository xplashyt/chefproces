import type { Metadata, Viewport } from 'next';

import './globals.css';

/**
 * Metadatos del sitio. `metadataBase` se omite a propósito: en local no hay un
 * dominio real y Next avisa; al desplegar, Vercel resuelve las URLs relativas.
 */
export const metadata: Metadata = {
  title: {
    default: 'Sazón Propio · Aprende a cocinar desde cero',
    template: '%s · Sazón Propio',
  },
  description:
    'Membresía de cocina para mujeres que empiezan de cero: técnica, recetas y el módulo de negocio para cobrar por lo que cocinas. Desde $48.900 COP, pago único.',
  keywords: [
    'curso de cocina',
    'aprender a cocinar',
    'cocina para principiantes',
    'vender comida desde casa',
    'repostería casera',
    'Colombia',
  ],
  authors: [{ name: 'Sazón Propio' }],
  openGraph: {
    title: 'Sazón Propio · Aprende a cocinar desde cero',
    description:
      'De no saber picar una cebolla a cobrar por tus platos. Clases cortas, recetas con ingredientes de tienda de barrio y comunidad de alumnas.',
    locale: 'es_CO',
    type: 'website',
    siteName: 'Sazón Propio',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // El color de la barra del navegador móvil hace juego con la crema del fondo.
  themeColor: '#fff8ec',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang="es-CO": el lector de pantalla pronuncia en español de Colombia y el
    // navegador ofrece la corrección ortográfica correcta en los campos.
    <html lang="es-CO">
      <body className="min-h-screen antialiased">
        {/* Salto de contenido: primer tabulador para quien usa teclado, oculto
            hasta que recibe foco. */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-carbon-800 focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
