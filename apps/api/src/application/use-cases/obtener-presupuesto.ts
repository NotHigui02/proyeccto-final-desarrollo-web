import type { Mes, Presupuesto } from '@gastos/shared';
import type { RepositorioPresupuestos } from '../ports/repositorio-presupuestos.js';
import { ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';

export class ObtenerPresupuesto {
  constructor(private readonly presupuestos: RepositorioPresupuestos) {}

  async ejecutar(uid: string, mes: Mes): Promise<Presupuesto> {
    const presupuesto = await this.presupuestos.obtener(uid, mes);
    if (!presupuesto) {
      throw new ErrorNoEncontrado('Presupuesto no encontrado');
    }
    return presupuesto;
  }
}
