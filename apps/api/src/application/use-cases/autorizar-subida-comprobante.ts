import type { AlmacenArchivos } from '../ports/almacen-archivos.js';

export class AutorizarSubidaComprobante {
  constructor(private readonly almacen: AlmacenArchivos) {}

  ejecutar(uid: string, body: unknown, request: Request): Promise<unknown> {
    return this.almacen.autorizarSubida({ uid, body, request });
  }
}
