import { crearMovimientoEntradaSchema, type Movimiento } from '@gastos/shared';
import { ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import type { RepositorioCategorias } from '../ports/repositorio-categorias.js';
import type { Reloj } from '../ports/reloj.js';
import type { RepositorioMovimientos } from '../ports/repositorio-movimientos.js';

export class CrearMovimiento {
  constructor(
    private readonly movimientos: RepositorioMovimientos,
    private readonly categorias: RepositorioCategorias,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(uid: string, datos: unknown): Promise<Movimiento> {
    const entrada = crearMovimientoEntradaSchema(() => this.reloj.ahora()).parse(datos);
    const categoria = await this.categorias.obtener(uid, entrada.categoriaId);
    if (!categoria) {
      throw new ErrorNoEncontrado('Categoría no encontrada');
    }
    return this.movimientos.crear(uid, entrada);
  }
}
