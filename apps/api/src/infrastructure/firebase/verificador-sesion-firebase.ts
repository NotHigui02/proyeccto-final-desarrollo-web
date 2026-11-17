import type { Rol, UsuarioSesion } from '@gastos/shared';
import type { Auth } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';
import type { App } from 'firebase-admin/app';
import { ErrorNoAutenticado, ErrorValidacion } from '../../domain/errors/errores-dominio.js';
import type { VerificadorSesion } from '../../application/ports/verificador-sesion.js';

/** Cookie de sesión: 5 días en milisegundos. */
export const DURACION_SESION_MS = 5 * 24 * 60 * 60 * 1000;

/** El idToken debe corresponder a un inicio de sesión reciente (5 minutos). */
const AUTH_TIME_MAXIMO_SEGUNDOS = 5 * 60;

export class VerificadorSesionFirebase implements VerificadorSesion {
  private readonly auth: Auth;

  constructor(app: App) {
    this.auth = getAuth(app);
  }

  async crearCookie(idToken: string): Promise<string> {
    let decodificado;
    try {
      decodificado = await this.auth.verifyIdToken(idToken);
    } catch {
      throw new ErrorNoAutenticado('Token inválido');
    }

    const ahora = Math.floor(Date.now() / 1000);
    if (ahora - decodificado.auth_time > AUTH_TIME_MAXIMO_SEGUNDOS) {
      throw new ErrorValidacion('Debe iniciar sesión de nuevo para crear la cookie');
    }

    try {
      return await this.auth.createSessionCookie(idToken, { expiresIn: DURACION_SESION_MS });
    } catch {
      throw new ErrorNoAutenticado('No se pudo crear la sesión');
    }
  }

  async verificarCookie(cookie: string): Promise<UsuarioSesion> {
    try {
      const decodificado = await this.auth.verifySessionCookie(cookie, true);
      return mapearUsuario(decodificado);
    } catch {
      throw new ErrorNoAutenticado('Sesión inválida o vencida');
    }
  }

  async verificarIdToken(token: string): Promise<UsuarioSesion> {
    try {
      const decodificado = await this.auth.verifyIdToken(token, true);
      return mapearUsuario(decodificado);
    } catch {
      throw new ErrorNoAutenticado('Token inválido o vencido');
    }
  }

  async revocar(uid: string): Promise<void> {
    await this.auth.revokeRefreshTokens(uid);
  }
}

function mapearUsuario(decodificado: {
  uid: string;
  email?: string;
  rol?: unknown;
}): UsuarioSesion {
  const rol: Rol = decodificado.rol === 'admin' ? 'admin' : 'usuario';
  return {
    uid: decodificado.uid,
    correo: decodificado.email ?? null,
    rol,
  };
}
