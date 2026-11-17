import type { UsuarioSesion } from '@gastos/shared';

export interface VerificadorSesion {
  crearCookie(idToken: string): Promise<string>;
  verificarCookie(cookie: string): Promise<UsuarioSesion>;
  verificarIdToken(token: string): Promise<UsuarioSesion>;
  revocar(uid: string): Promise<void>;
}
