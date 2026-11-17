import type { Movimiento } from '@gastos/shared';
import { ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import type { AlmacenArchivos } from '../ports/almacen-archivos.js';
import type { RepositorioMovimientos } from '../ports/repositorio-movimientos.js';

export class EliminarComprobante {
  constructor(
    private readonly movimientos: RepositorioMovimientos,
    private readonly almacen: AlmacenArchivos,
  ) {}

  async ejecutar(uid: string, movimientoId: string): Promise<Movimiento> {
    const movimiento = await this.movimientos.obtener(uid, movimientoId);
    if (!movimiento) {
      throw new ErrorNoEncontrado('Movimiento no encontrado');
    }
    if (!movimiento.comprobanteUrl) {
      throw new ErrorNoEncontrado('Comprobante no encontrado');
    }
    await this.almacen.eliminar(movimiento.comprobanteUrl);
    return this.movimientos.guardarComprobanteUrl(uid, movimientoId, null);
  }
}
