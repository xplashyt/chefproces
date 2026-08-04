import { Confianza } from '@/components/landing/Confianza';
import { CtaFinal } from '@/components/landing/CtaFinal';
import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { Incluye } from '@/components/landing/Incluye';
import { Nav } from '@/components/landing/Nav';
import { Planes } from '@/components/landing/Planes';
import { Preguntas } from '@/components/landing/Preguntas';
import { Temario } from '@/components/landing/Temario';

/**
 * Landing completa.
 *
 * NO lleva 'use client' en ningún nivel: todos estos componentes son de
 * servidor, así que la página se sirve como HTML puro. El navegador no descarga
 * ni ejecuta JavaScript de la aplicación para verla, y por eso el acordeón de
 * preguntas usa <details> y el menú móvil también. El único JavaScript del sitio
 * vive en /checkout, donde de verdad hace falta (tokenizar la tarjeta y
 * consultar el estado del pago).
 */
export default function PaginaInicio() {
  return (
    <>
      <Nav />
      <main id="contenido">
        <Hero />
        <Incluye />
        <Temario />
        <Planes />
        <Confianza />
        <Preguntas />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
