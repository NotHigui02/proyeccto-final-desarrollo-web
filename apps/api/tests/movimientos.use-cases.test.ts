import { describe, expect, it } from 'vitest';
import { CrearMovimiento } from '../src/application/use-cases/crear-movimiento.js';
import { EliminarMovimiento } from '../src/application/use-cases/eliminar-movimiento.js';
import { ListarMovimientos } from '../src/application/use-cases/listar-movimientos.js';
import { ErrorNoEncontrado } from '../src/domain/errors/errores-dominio.js';
import { AlmacenArchivosMemoria } from '../src/infrastructure/memoria/almacen-archivos-memoria.js';
import { RepositorioCategoriasMemoria } from '../src/infrastructure/memoria/repositorio-categorias-memoria.js';
import { RepositorioMovimientosMemoria } from '../src/infrastructure/memoria/repositorio-movimientos-memoria.js';
import { UID_DEMO } from '../src/infrastructure/memoria/semilla.js';
import { relojFijo } from './helpers.js';
import { ZodError } from 'zod';

const entradaValida = {
  tipo: 'gasto' as const,
  montoCentavos: 1_250_000,
  categoriaId: 'comida',
  nota: null,
  fecha: '2026-11-10',
  comprobanteUrl: null,
};

describe('casos de uso de movimientos', () => {
  it('rechaza monto 0 o negativo', async () => {
    const crear = new CrearMovimiento(
      new RepositorioMovimientosMemoria([]),
      new RepositorioCategoriasMemoria(),
      relojFijo,
    );
    await expect(
      crear.ejecutar(UID_DEMO, { ...entradaValida, montoCentavos: 0 }),
    ).rejects.toBeInstanceOf(ZodError);
    await expect(
      crear.ejecutar(UID_DEMO, { ...entradaValida, montoCentavos: -100 }),
    ).rejects.toBeInstanceOf(ZodError);
  });

  it('rechaza fecha futura', async () => {
    const crear = new CrearMovimiento(
      new RepositorioMovimientosMemoria([]),
      new RepositorioCategoriasMemoria(),
      relojFijo,
    );
    await expect(
      crear.ejecutar(UID_DEMO, { ...entradaValida, fecha: '2026-11-18' }),
    ).rejects.toBeInstanceOf(ZodError);
  });

  it('rechaza categoría inexistente con 404 de dominio', async () => {
    const crear = new CrearMovimiento(
      new RepositorioMovimientosMemoria([]),
      new RepositorioCategoriasMemoria([]),
      relojFijo,
    );
    await expect(crear.ejecutar(UID_DEMO, entradaValida)).rejects.toBeInstanceOf(ErrorNoEncontrado);
  });

  it('lista con paginación por cursor', async () => {
    const movimientos = new RepositorioMovimientosMemoria();
    const listar = new ListarMovimientos(movimientos);
    const primera = await listar.ejecutar(UID_DEMO, { mes: '2026-11' }, { limite: 2 });
    expect(primera.items).toHaveLength(2);
    expect(primera.siguienteCursor).toBeTruthy();
    const segunda = await listar.ejecutar(
      UID_DEMO,
      { mes: '2026-11' },
      { limite: 2, cursor: primera.siguienteCursor ?? undefined },
    );
    expect(segunda.items[0]?.id).not.toBe(primera.items[0]?.id);
  });

  it('elimina un movimiento existente', async () => {
    const movimientos = new RepositorioMovimientosMemoria([{ id: 'm1', ...entradaValida }]);
    await new EliminarMovimiento(movimientos, new AlmacenArchivosMemoria()).ejecutar(
      UID_DEMO,
      'm1',
    );
    expect(await movimientos.obtener(UID_DEMO, 'm1')).toBeNull();
  });
});
