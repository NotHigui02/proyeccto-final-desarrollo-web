import { ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import type { AlmacenArchivos, ArchivoDescarga } from '../ports/almacen-archivos.js';
import type { RepositorioMovimientos } from '../ports/repositorio-movimientos.js';

export class ObtenerComprobante {
  constructor(
    private readonly movimientos: RepositorioMovimientos,
    private readonly almacen: AlmacenArchivos,
  ) {}

  async ejecutar(uid: string, movimientoId: string): Promise<ArchivoDescarga> {
    const movimiento = await this.movimientos.obtener(uid, movimientoId);
    if (!movimiento?.comprobanteUrl) {
      throw new ErrorNoEncontrado('Comprobante no encontrado');
    }
    const archivo = await this.almacen.obtener(movimiento.comprobanteUrl);
    if (!archivo) {
      throw new ErrorNoEncontrado('Comprobante no encontrado');
    }
    return archivo;
  }
}
