import type { UsuarioSesion } from '@gastos/shared';
import type { VerificadorSesion } from '../ports/verificador-sesion.js';

export class CerrarSesion {
  constructor(private readonly verificador: VerificadorSesion) {}

  async ejecutar(usuario: UsuarioSesion): Promise<void> {
    await this.verificador.revocar(usuario.uid);
  }
}
