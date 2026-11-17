import { ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import type { AlmacenArchivos } from '../ports/almacen-archivos.js';
import type { RepositorioMovimientos } from '../ports/repositorio-movimientos.js';

export class EliminarMovimiento {
  constructor(
    private readonly movimientos: RepositorioMovimientos,
    private readonly almacen: AlmacenArchivos,
  ) {}

  async ejecutar(uid: string, id: string): Promise<void> {
    const actual = await this.movimientos.obtener(uid, id);
    if (!actual) {
      throw new ErrorNoEncontrado('Movimiento no encontrado');
    }
    if (actual.comprobanteUrl) {
      await this.almacen.eliminar(actual.comprobanteUrl);
    }
    await this.movimientos.eliminar(uid, id);
  }
}
