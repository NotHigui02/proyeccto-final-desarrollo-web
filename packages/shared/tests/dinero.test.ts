import { describe, expect, it } from 'vitest';
import { formatearCOP, montoCentavosSchema, pesosACentavos } from '../src/dinero.js';

describe('montoCentavosSchema', () => {
  it('acepta enteros positivos', () => {
    expect(montoCentavosSchema.parse(1)).toBe(1);
    expect(montoCentavosSchema.parse(1_250_000)).toBe(1_250_000);
  });

  it.each([0, -1, 12.5, Number.NaN, Number.POSITIVE_INFINITY])('rechaza %s', (valor) => {
    expect(montoCentavosSchema.safeParse(valor).success).toBe(false);
  });
});

describe('formatearCOP', () => {
  it('formatea 1250000 centavos como $ 12.500', () => {
    expect(formatearCOP(1_250_000)).toBe('$ 12.500');
  });

  it('formatea montos pequeños sin separador de miles', () => {
    expect(formatearCOP(100)).toBe('$ 1');
  });
});

describe('pesosACentavos', () => {
  it('convierte pesos con punto de miles a centavos', () => {
    expect(pesosACentavos('12.500')).toBe(1_250_000);
  });

  it('convierte decimales con coma a centavos enteros', () => {
    expect(pesosACentavos('12.500,50')).toBe(1_250_050);
  });

  it('rechaza texto vacío o inválido', () => {
    expect(() => pesosACentavos('')).toThrow(RangeError);
    expect(() => pesosACentavos('abc')).toThrow(RangeError);
  });
});
