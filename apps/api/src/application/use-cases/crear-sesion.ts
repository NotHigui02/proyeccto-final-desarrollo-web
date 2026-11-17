import { crearSesionSchema } from '@gastos/shared';
import type { VerificadorSesion } from '../ports/verificador-sesion.js';

export class CrearSesion {
  constructor(private readonly verificador: VerificadorSesion) {}

  async ejecutar(cuerpo: unknown): Promise<string> {
    const { idToken } = crearSesionSchema.parse(cuerpo);
    return this.verificador.crearCookie(idToken);
  }
}
