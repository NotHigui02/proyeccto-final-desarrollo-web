import type { UsuarioSesion } from '@gastos/shared';
import { ErrorNoAutenticado, ErrorValidacion } from '../../domain/errors/errores-dominio.js';
import type { VerificadorSesion } from '../../application/ports/verificador-sesion.js';

interface TokenDemo {
  uid: string;
  correo: string | null;
  rol: UsuarioSesion['rol'];
  authTime: number;
}

/** Verificador determinista para pruebas (sin Firebase). */
export class VerificadorSesionMemoria implements VerificadorSesion {
  private readonly cookies = new Map<string, UsuarioSesion>();
  private readonly tokens = new Map<string, TokenDemo>();
  private revocados = new Set<string>();

  /** Registra un idToken de prueba. `authTime` en segundos Unix. */
  registrarIdToken(
    idToken: string,
    usuario: Omit<UsuarioSesion, 'correo'> & { correo?: string | null },
    authTime = Math.floor(Date.now() / 1000),
  ): void {
    this.tokens.set(idToken, {
      uid: usuario.uid,
      correo: usuario.correo ?? null,
      rol: usuario.rol,
      authTime,
    });
  }

  async crearCookie(idToken: string): Promise<string> {
    const token = this.tokens.get(idToken);
    if (!token) throw new ErrorNoAutenticado('Token inválido');
    const ahora = Math.floor(Date.now() / 1000);
    if (ahora - token.authTime > 5 * 60) {
      throw new ErrorValidacion('Debe iniciar sesión de nuevo para crear la cookie');
    }
    const cookie = `cookie-${idToken}`;
    this.cookies.set(cookie, {
      uid: token.uid,
      correo: token.correo,
      rol: token.rol,
    });
    return Promise.resolve(cookie);
  }

  verificarCookie(cookie: string): Promise<UsuarioSesion> {
    const usuario = this.cookies.get(cookie);
    if (!usuario || this.revocados.has(usuario.uid)) {
      return Promise.reject(new ErrorNoAutenticado('Sesión inválida o vencida'));
    }
    return Promise.resolve(usuario);
  }

  verificarIdToken(token: string): Promise<UsuarioSesion> {
    const datos = this.tokens.get(token);
    if (!datos || this.revocados.has(datos.uid)) {
      return Promise.reject(new ErrorNoAutenticado('Token inválido o vencido'));
    }
    return Promise.resolve({
      uid: datos.uid,
      correo: datos.correo,
      rol: datos.rol,
    });
  }

  revocar(uid: string): Promise<void> {
    this.revocados.add(uid);
    for (const [clave, usuario] of this.cookies) {
      if (usuario.uid === uid) this.cookies.delete(clave);
    }
    return Promise.resolve();
  }
}
