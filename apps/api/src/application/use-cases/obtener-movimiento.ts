import type { Movimiento } from '@gastos/shared';
import { ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import type { RepositorioMovimientos } from '../ports/repositorio-movimientos.js';

export class ObtenerMovimiento {
  constructor(private readonly movimientos: RepositorioMovimientos) {}

  async ejecutar(uid: string, id: string): Promise<Movimiento> {
    const movimiento = await this.movimientos.obtener(uid, id);
    if (!movimiento) {
      throw new ErrorNoEncontrado('Movimiento no encontrado');
    }
    return movimiento;
  }
}
