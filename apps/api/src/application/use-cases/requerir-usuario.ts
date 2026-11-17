import type { UsuarioSesion } from '@gastos/shared';
import { ErrorNoAutenticado } from '../../domain/errors/errores-dominio.js';
import type {
  CredencialesPeticion,
  RequerirUsuario as PuertoRequerirUsuario,
} from '../ports/requerir-usuario.js';
import type { VerificadorSesion } from '../ports/verificador-sesion.js';

export class RequerirUsuario implements PuertoRequerirUsuario {
  constructor(private readonly verificador: VerificadorSesion) {}

  async ejecutar(credenciales: CredencialesPeticion): Promise<UsuarioSesion> {
    const bearer = extraerBearer(credenciales.authorization);
    if (bearer) {
      return this.verificador.verificarIdToken(bearer);
    }
    if (credenciales.cookieSesion) {
      return this.verificador.verificarCookie(credenciales.cookieSesion);
    }
    throw new ErrorNoAutenticado();
  }
}

function extraerBearer(authorization: string | undefined): string | undefined {
  if (!authorization) return undefined;
  const [esquema, token] = authorization.split(' ');
  if (esquema?.toLowerCase() !== 'bearer' || !token) return undefined;
  return token;
}
