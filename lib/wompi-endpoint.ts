/**
 * Resolución del ambiente de Wompi.
 *
 * Este archivo vive aparte y NO importa nada a propósito: lo usan tanto el
 * navegador (tokenización) como el servidor (transacciones). Si estuviera
 * dentro de wompi-server.ts, importarlo desde el cliente arrastraría
 * `node:crypto` al bundle y el build fallaría.
 */

export const WOMPI_SANDBOX = 'https://api-sandbox.co.uat.wompi.dev/v1';
export const WOMPI_PRODUCCION = 'https://production.wompi.co/v1';

/**
 * El ambiente se deduce del prefijo de la llave, no de una variable extra:
 * así es imposible quedar con llaves de prueba apuntando a producción (o al
 * revés), que es el error clásico al desplegar.
 */
export function wompiBaseUrl(llave: string): string {
  return llave.startsWith('pub_prod_') || llave.startsWith('prv_prod_')
    ? WOMPI_PRODUCCION
    : WOMPI_SANDBOX;
}

export function esAmbientePruebas(llave: string): boolean {
  return !llave.startsWith('pub_prod_') && !llave.startsWith('prv_prod_');
}
