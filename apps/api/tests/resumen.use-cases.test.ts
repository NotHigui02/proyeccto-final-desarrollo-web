import { describe, expect, it } from 'vitest';
import { ObtenerResumenMes } from '../src/application/use-cases/obtener-resumen-mes.js';
import { RepositorioCategoriasMemoria } from '../src/infrastructure/memoria/repositorio-categorias-memoria.js';
import { RepositorioMovimientosMemoria } from '../src/infrastructure/memoria/repositorio-movimientos-memoria.js';
import { UID_DEMO } from '../src/infrastructure/memoria/semilla.js';

describe('ObtenerResumenMes', () => {
  it('calcula totales reales del mes y 6 puntos de evolución', async () => {
    const caso = new ObtenerResumenMes(
      new RepositorioCategoriasMemoria(),
      new RepositorioMovimientosMemoria(),
    );

    const resumen = await caso.ejecutar(UID_DEMO, '2026-11');

    expect(resumen.mes).toBe('2026-11');
    expect(resumen.ingresosCentavos).toBe(3_000_000);
    expect(resumen.gastosCentavos).toBe(2_500_000);
    expect(resumen.saldoCentavos).toBe(500_000);
    expect(resumen.porCategoria).toHaveLength(3);
    expect(resumen.evolucion).toHaveLength(6);
    expect(resumen.evolucion[0]?.mes).toBe('2026-06');
    expect(resumen.evolucion[5]?.mes).toBe('2026-11');
  });

  it('refleja movimientos creados en el repositorio', async () => {
    const categorias = new RepositorioCategoriasMemoria([]);
    const movimientos = new RepositorioMovimientosMemoria([]);
    await categorias.crear(UID_DEMO, { nombre: 'Comida', color: '#E11D48' });
    const cats = await categorias.listar(UID_DEMO);
    const categoriaId = cats[0]?.id;
    if (!categoriaId) throw new Error('sin categoría');

    await movimientos.crear(UID_DEMO, {
      tipo: 'gasto',
      montoCentavos: 50_000,
      categoriaId,
      nota: null,
      fecha: '2026-11-10',
      comprobanteUrl: null,
    });

    const resumen = await new ObtenerResumenMes(categorias, movimientos).ejecutar(
      UID_DEMO,
      '2026-11',
    );

    expect(resumen.gastosCentavos).toBe(50_000);
    expect(resumen.porCategoria).toEqual([
      expect.objectContaining({ categoriaId, gastoCentavos: 50_000 }),
    ]);
  });
});
