import { describe, expect, it } from 'vitest';
import type { Categoria } from '../src/categoria.js';
import type { Movimiento } from '../src/movimiento.js';
import { calcularResumen } from '../src/resumen.js';

const categorias: Categoria[] = [
  { id: 'comida', nombre: 'Comida', color: '#E11D48' },
  { id: 'transporte', nombre: 'Transporte', color: '#2563EB' },
  { id: 'sueldo', nombre: 'Sueldo', color: '#0B5D4B' },
];

const movimientos: Movimiento[] = [
  {
    id: '1',
    tipo: 'ingreso',
    montoCentavos: 3_000_000,
    categoriaId: 'sueldo',
    nota: null,
    fecha: '2026-11-01',
    comprobanteUrl: null,
  },
  {
    id: '2',
    tipo: 'gasto',
    montoCentavos: 1_250_000,
    categoriaId: 'comida',
    nota: null,
    fecha: '2026-11-05',
    comprobanteUrl: null,
  },
  {
    id: '3',
    tipo: 'gasto',
    montoCentavos: 500_000,
    categoriaId: 'transporte',
    nota: null,
    fecha: '2026-11-08',
    comprobanteUrl: null,
  },
];

describe('calcularResumen', () => {
  it('calcula totales por categoría con 3 movimientos', () => {
    const resumen = calcularResumen('2026-11', movimientos, categorias);

    expect(resumen).toEqual({
      mes: '2026-11',
      ingresosCentavos: 3_000_000,
      gastosCentavos: 1_750_000,
      saldoCentavos: 1_250_000,
      porCategoria: [
        { categoriaId: 'comida', nombre: 'Comida', color: '#E11D48', gastoCentavos: 1_250_000 },
        {
          categoriaId: 'transporte',
          nombre: 'Transporte',
          color: '#2563EB',
          gastoCentavos: 500_000,
        },
      ],
      evolucion: [],
    });
  });

  it('CA-1: un gasto de $12.500 baja el saldo exactamente $12.500 (sin redondeo)', () => {
    const ingreso: Movimiento = {
      id: 'i',
      tipo: 'ingreso',
      montoCentavos: 5_000_000,
      categoriaId: 'sueldo',
      nota: null,
      fecha: '2026-11-01',
      comprobanteUrl: null,
    };
    const gasto: Movimiento = {
      id: 'g',
      tipo: 'gasto',
      montoCentavos: 1_250_000,
      categoriaId: 'comida',
      nota: null,
      fecha: '2026-11-10',
      comprobanteUrl: null,
    };

    const antes = calcularResumen('2026-11', [ingreso], categorias);
    const despues = calcularResumen('2026-11', [ingreso, gasto], categorias);

    expect(despues.saldoCentavos).toBe(antes.saldoCentavos - 1_250_000);
    expect(despues.saldoCentavos).toBe(3_750_000);
  });
});
