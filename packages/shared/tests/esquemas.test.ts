import { describe, expect, it } from 'vitest';
import { categoriaEntradaSchema } from '../src/categoria.js';
import { crearMovimientoEntradaSchema } from '../src/movimiento.js';
import { paginacionSchema } from '../src/paginacion.js';

const relojFijo = () => new Date('2026-11-17T15:00:00.000Z');
const movimientoEntradaPruebaSchema = crearMovimientoEntradaSchema(relojFijo);

describe('categoriaEntradaSchema', () => {
  it('acepta nombre recortado y color hex', () => {
    expect(categoriaEntradaSchema.parse({ nombre: '  Casa  ', color: '#0B5D4B' })).toEqual({
      nombre: 'Casa',
      color: '#0B5D4B',
    });
  });

  it('rechaza campos desconocidos', () => {
    expect(
      categoriaEntradaSchema.safeParse({ nombre: 'Casa', color: '#0B5D4B', extra: true }).success,
    ).toBe(false);
  });

  it.each(['rojo', '#FFF', '#gg0000', ''])('rechaza color %s', (color) => {
    expect(categoriaEntradaSchema.safeParse({ nombre: 'Casa', color }).success).toBe(false);
  });
});

describe('movimientoEntradaSchema', () => {
  const valido = {
    tipo: 'gasto' as const,
    montoCentavos: 1_250_000,
    categoriaId: 'cat-1',
    nota: null,
    fecha: '2026-11-10',
    comprobanteUrl: null,
  };

  it('acepta un movimiento válido', () => {
    expect(movimientoEntradaPruebaSchema.parse(valido)).toEqual(valido);
  });

  it('rechaza monto 0, negativo o decimal', () => {
    expect(movimientoEntradaPruebaSchema.safeParse({ ...valido, montoCentavos: 0 }).success).toBe(
      false,
    );
    expect(
      movimientoEntradaPruebaSchema.safeParse({ ...valido, montoCentavos: -100 }).success,
    ).toBe(false);
    expect(
      movimientoEntradaPruebaSchema.safeParse({ ...valido, montoCentavos: 10.5 }).success,
    ).toBe(false);
  });

  it('rechaza campos desconocidos', () => {
    expect(movimientoEntradaPruebaSchema.safeParse({ ...valido, uid: 'hacker' }).success).toBe(
      false,
    );
  });
});

describe('paginacionSchema', () => {
  it('usa límite 20 por defecto', () => {
    expect(paginacionSchema.parse({})).toEqual({ limite: 20 });
  });

  it('acepta cursor y límite válido', () => {
    expect(paginacionSchema.parse({ limite: '50', cursor: 'abc' })).toEqual({
      limite: 50,
      cursor: 'abc',
    });
  });

  it('rechaza límite fuera de rango', () => {
    expect(paginacionSchema.safeParse({ limite: 0 }).success).toBe(false);
    expect(paginacionSchema.safeParse({ limite: 101 }).success).toBe(false);
  });
});
