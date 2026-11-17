import { registrarComprobanteSchema, type Movimiento } from '@gastos/shared';
import { ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import type { AlmacenArchivos } from '../ports/almacen-archivos.js';
import type { RepositorioMovimientos } from '../ports/repositorio-movimientos.js';

export class RegistrarComprobante {
  constructor(
    private readonly movimientos: RepositorioMovimientos,
    private readonly almacen: AlmacenArchivos,
  ) {}

  async ejecutar(uid: string, movimientoId: string, datos: unknown): Promise<Movimiento> {
    const { pathname } = registrarComprobanteSchema.parse(datos);
    const movimiento = await this.movimientos.obtener(uid, movimientoId);
    if (!movimiento) {
      throw new ErrorNoEncontrado('Movimiento no encontrado');
    }

    if (movimiento.comprobanteUrl) {
      await this.almacen.eliminar(movimiento.comprobanteUrl);
    }

    const registrado = await this.almacen.registrar(uid, pathname);
    return this.movimientos.guardarComprobanteUrl(uid, movimientoId, registrado.url);
  }
}
