import type { UsuarioSesion } from '@gastos/shared';

export class ObtenerUsuarioActual {
  ejecutar(usuario: UsuarioSesion): { usuario: UsuarioSesion } {
    return { usuario };
  }
}
