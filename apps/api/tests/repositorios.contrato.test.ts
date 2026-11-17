import { describe, expect, it } from 'vitest';
import type { RepositorioCategorias } from '../src/application/ports/repositorio-categorias.js';
import type { RepositorioMovimientos } from '../src/application/ports/repositorio-movimientos.js';
import type { RepositorioPresupuestos } from '../src/application/ports/repositorio-presupuestos.js';
import { RepositorioCategoriasMemoria } from '../src/infrastructure/memoria/repositorio-categorias-memoria.js';
import { RepositorioMovimientosMemoria } from '../src/infrastructure/memoria/repositorio-movimientos-memoria.js';
import { RepositorioPresupuestosMemoria } from '../src/infrastructure/memoria/repositorio-presupuestos-memoria.js';

const UID = 'contrato-uid';

function suiteCategorias(nombre: string, crear: () => RepositorioCategorias) {
  describe(nombre, () => {
    it('crea, lista y evita nombres duplicados', async () => {
      const repo = crear();
      const creada = await repo.crear(UID, { nombre: 'Comida', color: '#E11D48' });
      expect(creada.nombre).toBe('Comida');
      expect(await repo.existeNombre(UID, 'comida')).toBe(true);
      expect(await repo.listar(UID)).toHaveLength(1);
      expect(await repo.obtener(UID, creada.id)).toEqual(creada);
    });
  });
}

function suiteMovimientos(nombre: string, crear: () => RepositorioMovimientos) {
  describe(nombre, () => {
    it('crea, pagina por cursor y cuenta por categoría', async () => {
      const repo = crear();
      const a = await repo.crear(UID, {
        tipo: 'gasto',
        montoCentavos: 1000,
        categoriaId: 'cat-1',
        nota: null,
        fecha: '2026-11-10',
        comprobanteUrl: null,
      });
      const b = await repo.crear(UID, {
        tipo: 'gasto',
        montoCentavos: 2000,
        categoriaId: 'cat-1',
        nota: null,
        fecha: '2026-11-11',
        comprobanteUrl: null,
      });

      const pagina = await repo.listar(UID, { mes: '2026-11' }, { limite: 1 });
      expect(pagina.items).toHaveLength(1);
      expect(pagina.items[0]?.id).toBe(b.id);
      expect(pagina.siguienteCursor).toBe(b.id);

      const resto = await repo.listar(
        UID,
        { mes: '2026-11' },
        { limite: 1, cursor: pagina.siguienteCursor ?? undefined },
      );
      expect(resto.items[0]?.id).toBe(a.id);
      expect(await repo.contarPorCategoria(UID, 'cat-1')).toBe(2);
    });
  });
}

function suitePresupuestos(nombre: string, crear: () => RepositorioPresupuestos) {
  describe(nombre, () => {
    it('guarda y obtiene el presupuesto del mes', async () => {
      const repo = crear();
      expect(await repo.obtener(UID, '2026-11')).toBeNull();
      const guardado = await repo.guardar(UID, '2026-11', { montoCentavos: 500_000 });
      expect(guardado).toEqual({ mes: '2026-11', montoCentavos: 500_000 });
      expect(await repo.obtener(UID, '2026-11')).toEqual(guardado);
    });
  });
}

suiteCategorias(
  'RepositorioCategoriasMemoria (contrato)',
  () => new RepositorioCategoriasMemoria([]),
);
suiteMovimientos(
  'RepositorioMovimientosMemoria (contrato)',
  () => new RepositorioMovimientosMemoria([]),
);
suitePresupuestos(
  'RepositorioPresupuestosMemoria (contrato)',
  () => new RepositorioPresupuestosMemoria(),
);
