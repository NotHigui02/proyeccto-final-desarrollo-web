import {
  presupuestoEntradaSchema,
  type Mes,
  type Presupuesto,
  type PresupuestoEntrada,
} from '@gastos/shared';
import type { RepositorioPresupuestos } from '../ports/repositorio-presupuestos.js';

export class GuardarPresupuesto {
  constructor(private readonly presupuestos: RepositorioPresupuestos) {}

  async ejecutar(uid: string, mes: Mes, cuerpo: unknown): Promise<Presupuesto> {
    const entrada: PresupuestoEntrada = presupuestoEntradaSchema.parse(cuerpo);
    return this.presupuestos.guardar(uid, mes, entrada);
  }
}
