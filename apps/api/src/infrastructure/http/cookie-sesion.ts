import { DURACION_SESION_MS } from '../firebase/verificador-sesion-firebase.js';

export const NOMBRE_COOKIE_SESION = 'sesion';

export function leerCookie(cabecera: string | undefined, nombre: string): string | undefined {
  if (!cabecera) return undefined;
  for (const parte of cabecera.split(';')) {
    const [clave, ...resto] = parte.trim().split('=');
    if (clave === nombre) return resto.join('=');
  }
  return undefined;
}

export function cabeceraSetCookieSesion(
  valor: string,
  opciones: { secure: boolean; maxAgeSegundos?: number },
): string {
  const maxAge = opciones.maxAgeSegundos ?? Math.floor(DURACION_SESION_MS / 1000);
  const partes = [
    `${NOMBRE_COOKIE_SESION}=${valor}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${String(maxAge)}`,
  ];
  if (opciones.secure) partes.push('Secure');
  return partes.join('; ');
}

export function cabeceraBorrarCookieSesion(secure: boolean): string {
  return cabeceraSetCookieSesion('', { secure, maxAgeSegundos: 0 });
}
