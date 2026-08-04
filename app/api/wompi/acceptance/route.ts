/**
 * GET /api/wompi/acceptance
 *
 * Devuelve los tokens y los permalinks de los contratos de Wompi (términos de
 * la pasarela y autorización de datos personales) que la usuaria debe aceptar
 * antes de pagar.
 *
 * Se hace por nuestro servidor en vez de llamar a Wompi desde el navegador para
 * que el formulario tenga un solo origen de red y para poder cambiar de
 * ambiente (sandbox/producción) sin tocar el cliente.
 */

import { NextResponse } from 'next/server';

import { obtenerTokensAceptacion } from '@/lib/wompi-server';

// Los tokens vienen firmados y con vencimiento: nunca se cachean.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tokens = await obtenerTokensAceptacion();
    return NextResponse.json(tokens, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[acceptance] no se pudieron obtener los tokens', error);
    return NextResponse.json(
      { mensaje: 'No pudimos cargar los términos de la pasarela. Intenta de nuevo.' },
      { status: 502 },
    );
  }
}
