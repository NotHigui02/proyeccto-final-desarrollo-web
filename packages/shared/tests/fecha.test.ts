import { describe, expect, it } from 'vitest';
import {
  crearFechaMovimientoSchema,
  formatearFecha,
  mesAnterior,
  mesDeFecha,
  mesSiguiente,
  rangoDelMes,
} from '../src/fecha.js';

const relojFijo = () => new Date('2026-11-17T15:00:00.000Z');
const fechaSchema = crearFechaMovimientoSchema(relojFijo);

describe('crearFechaMovimientoSchema', () => {
  it('acepta una fecha válida no futura', () => {
    expect(fechaSchema.parse('2026-11-17')).toBe('2026-11-17');
    expect(fechaSchema.parse('2026-02-28')).toBe('2026-02-28');
  });

  it('acepta 29 de febrero en año bisiesto', () => {
    expect(fechaSchema.parse('2024-02-29')).toBe('2024-02-29');
  });

  it('rechaza fechas futuras respecto al reloj', () => {
    expect(fechaSchema.safeParse('2026-11-18').success).toBe(false);
  });

  it.each(['2026-02-30', '2025-02-29', '2026-13-01', '26-11-17', '2026/11/17'])(
    'rechaza %s',
    (valor) => {
      expect(fechaSchema.safeParse(valor).success).toBe(false);
    },
  );
});

describe('formatearFecha', () => {
  it('formatea en es-CO', () => {
    expect(formatearFecha('2026-11-17')).toBe('17/11/2026');
  });
});

describe('utilidades de mes', () => {
  it('obtiene el mes de una fecha', () => {
    expect(mesDeFecha('2026-11-17')).toBe('2026-11');
  });

  it('calcula el rango del mes (incluye febrero bisiesto)', () => {
    expect(rangoDelMes('2026-11')).toEqual({ desde: '2026-11-01', hasta: '2026-11-30' });
    expect(rangoDelMes('2024-02')).toEqual({ desde: '2024-02-01', hasta: '2024-02-29' });
  });

  it('navega entre meses cruzando año', () => {
    expect(mesAnterior('2026-01')).toBe('2025-12');
    expect(mesSiguiente('2025-12')).toBe('2026-01');
  });
});
