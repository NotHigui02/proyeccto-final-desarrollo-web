import type { FastifyRequest } from 'fastify';
import type { RequerirUsuario } from '../../../application/ports/requerir-usuario.js';
import { leerCookie, NOMBRE_COOKIE_SESION } from '../cookie-sesion.js';

export function crearHookRequerirUsuario(requerirUsuario: RequerirUsuario) {
  return async (request: FastifyRequest): Promise<void> => {
    const usuario = await requerirUsuario.ejecutar({
      cookieSesion: leerCookie(request.headers.cookie, NOMBRE_COOKIE_SESION),
      authorization:
        typeof request.headers.authorization === 'string'
          ? request.headers.authorization
          : undefined,
    });
    request.usuario = usuario;
  };
}

export function uidDePeticion(request: FastifyRequest): string {
  const uid = request.usuario?.uid;
  if (!uid) {
    throw new Error('Se esperaba request.usuario tras requerirUsuario');
  }
  return uid;
}
