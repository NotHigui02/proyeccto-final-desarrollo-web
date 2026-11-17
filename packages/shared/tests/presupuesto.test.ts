import { describe, expect, it } from 'vitest';
import { estadoPresupuesto } from '../src/presupuesto.js';

describe('estadoPresupuesto', () => {
  it('es normal bajo el 80 %', () => {
    expect(estadoPresupuesto(79, 100)).toEqual({ porcentaje: 79, nivel: 'normal' });
  });

  it('alerta desde el 80 %', () => {
    expect(estadoPresupuesto(80, 100)).toEqual({ porcentaje: 80, nivel: 'alerta' });
    expect(estadoPresupuesto(99, 100)).toEqual({ porcentaje: 99, nivel: 'alerta' });
  });

  it('excedido al 100 %', () => {
    expect(estadoPresupuesto(100, 100)).toEqual({ porcentaje: 100, nivel: 'excedido' });
  });

  it('excedido por encima del 100 %', () => {
    expect(estadoPresupuesto(150, 100)).toEqual({ porcentaje: 150, nivel: 'excedido' });
  });
});
