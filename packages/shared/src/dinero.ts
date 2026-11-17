import { z } from 'zod';

/** Límite superior razonable: $99.999.999,99 COP en centavos. */
export const MONTO_CENTAVOS_MAXIMO = 9_999_999_999;

export const montoCentavosSchema = z
  .number()
  .int('El monto debe ser un entero de centavos')
  .positive('El monto debe ser mayor que 0')
  .max(MONTO_CENTAVOS_MAXIMO, 'El monto supera el límite permitido');

export type MontoCentavos = z.infer<typeof montoCentavosSchema>;

function formatearCOPManual(centavos: number): string {
  const pesos = Math.trunc(centavos / 100);
  const conMiles = String(Math.abs(pesos)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return pesos < 0 ? `-$ ${conMiles}` : `$ ${conMiles}`;
}

/**
 * Formatea centavos a COP sin decimales.
 * Normaliza el espacio no separable de `Intl` a un espacio normal para comparación estable.
 */
export function formatearCOP(centavos: number): string {
  if (!Number.isFinite(centavos) || !Number.isInteger(centavos)) {
    throw new RangeError('El monto en centavos debe ser un entero finito');
  }

  if (typeof Intl === 'undefined' || typeof Intl.NumberFormat !== 'function') {
    return formatearCOPManual(centavos);
  }

  const formateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(centavos / 100);

  return formateado.replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ');
}

/**
 * Convierte un texto de pesos (p. ej. "12.500" o "12500,50") a centavos enteros.
 * No usa `parseFloat` para evitar errores de redondeo en decimales.
 */
export function pesosACentavos(texto: string): number {
  const limpio = texto.trim().replace(/\s/g, '');
  if (limpio === '' || limpio === '-' || limpio === '+') {
    throw new RangeError('El monto no puede estar vacío');
  }

  const negativo = limpio.startsWith('-');
  const positivo = limpio.startsWith('+');
  const cuerpo = negativo || positivo ? limpio.slice(1) : limpio;

  let enteros: string;
  let decimales = '';

  if (cuerpo.includes(',')) {
    const [parteEntera = '', parteDecimal = ''] = cuerpo.split(',');
    if (cuerpo.split(',').length !== 2) {
      throw new RangeError('El monto tiene un formato inválido');
    }
    enteros = parteEntera.replace(/\./g, '');
    decimales = parteDecimal;
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cuerpo)) {
    enteros = cuerpo.replace(/\./g, '');
  } else if (/^\d+(\.\d{1,2})?$/.test(cuerpo)) {
    const [parteEntera = '', parteDecimal = ''] = cuerpo.split('.');
    enteros = parteEntera;
    decimales = parteDecimal;
  } else {
    enteros = cuerpo.replace(/\./g, '');
  }

  if (!/^\d+$/.test(enteros) || (decimales !== '' && !/^\d{1,2}$/.test(decimales))) {
    throw new RangeError('El monto tiene un formato inválido');
  }

  const centavosDecimales = (decimales + '00').slice(0, 2);
  const total = Number(enteros) * 100 + Number(centavosDecimales);
  return negativo ? -total : total;
}
