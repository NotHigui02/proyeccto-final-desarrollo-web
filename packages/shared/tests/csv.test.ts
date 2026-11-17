import { describe, expect, it } from 'vitest';
import { escaparCeldaCsv, generarCSV } from '../src/csv.js';
import type { Categoria, Movimiento } from '../src/index.js';

const categorias: Categoria[] = [{ id: 'comida', nombre: 'Comida', color: '#E11D48' }];

describe('escaparCeldaCsv', () => {
  it('previene inyección de fórmulas', () => {
    expect(escaparCeldaCsv('=1+1')).toBe("'=1+1");
    expect(escaparCeldaCsv('+cmd')).toBe("'+cmd");
    expect(escaparCeldaCsv('-2')).toBe("'-2");
    expect(escaparCeldaCsv('@x')).toBe("'@x");
  });

  it('escapa comillas y separadores', () => {
    expect(escaparCeldaCsv('a"b')).toBe('"a""b"');
    expect(escaparCeldaCsv('a;b')).toBe('"a;b"');
  });
});

describe('generarCSV', () => {
  it('incluye BOM, cabeceras y montos en centavos y COP', () => {
    const movimientos: Movimiento[] = [
      {
        id: 'm1',
        tipo: 'gasto',
        montoCentavos: 12_500,
        categoriaId: 'comida',
        nota: 'Almuerzo',
        fecha: '2026-11-05',
        comprobanteUrl: null,
      },
    ];

    const csv = generarCSV(movimientos, categorias);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('id;fecha;tipo;categoria;nota;montoCentavos;montoCOP');
    expect(csv).toContain('m1;2026-11-05;gasto;Comida;Almuerzo;12500;');
  });

  it('exporta solo cabeceras si el mes está vacío', () => {
    const csv = generarCSV([], categorias);
    const sinBom = csv.replace(/^\uFEFF/, '');
    expect(sinBom.trim()).toBe('id;fecha;tipo;categoria;nota;montoCentavos;montoCOP');
  });

  it('escapa notas peligrosas', () => {
    const movimientos: Movimiento[] = [
      {
        id: 'm2',
        tipo: 'gasto',
        montoCentavos: 100,
        categoriaId: 'comida',
        nota: '=CMD()',
        fecha: '2026-11-01',
        comprobanteUrl: null,
      },
    ];
    const csv = generarCSV(movimientos, categorias);
    expect(csv).toContain("'=CMD()");
  });
});
