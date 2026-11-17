import { z } from 'zod';
import { mesSchema, type Mes } from './mes.js';

const FECHA_ISO = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export type Reloj = () => Date;

function hoyComoTexto(ahora: Date): string {
  const año = ahora.getUTCFullYear();
  const mes = String(ahora.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getUTCDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

function esFechaCalendarioValida(año: number, mes: number, dia: number): boolean {
  const fecha = new Date(Date.UTC(año, mes - 1, dia));
  return (
    fecha.getUTCFullYear() === año && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia
  );
}

export function crearFechaMovimientoSchema(hoy: Reloj = () => new Date()) {
  return z
    .string()
    .regex(FECHA_ISO, 'La fecha debe tener el formato AAAA-MM-DD')
    .superRefine((valor, contexto) => {
      const coincidencia = FECHA_ISO.exec(valor);
      if (!coincidencia) return;

      const año = Number(coincidencia[1]);
      const mes = Number(coincidencia[2]);
      const dia = Number(coincidencia[3]);

      if (!esFechaCalendarioValida(año, mes, dia)) {
        contexto.addIssue({
          code: 'custom',
          message: 'La fecha no es un día válido del calendario',
        });
        return;
      }

      if (valor > hoyComoTexto(hoy())) {
        contexto.addIssue({
          code: 'custom',
          message: 'La fecha no puede ser futura',
        });
      }
    });
}

/** Esquema con el reloj del sistema. Para pruebas use `crearFechaMovimientoSchema(relojFijo)`. */
export const fechaMovimientoSchema = crearFechaMovimientoSchema();

export type FechaMovimiento = z.infer<typeof fechaMovimientoSchema>;

function formatearFechaManual(fecha: string): string {
  const [, año = '', mes = '', dia = ''] = FECHA_ISO.exec(fecha) ?? [];
  return `${dia}/${mes}/${año}`;
}

export function formatearFecha(fecha: string): string {
  const coincidencia = FECHA_ISO.exec(fecha);
  if (!coincidencia) {
    throw new RangeError('La fecha debe tener el formato AAAA-MM-DD');
  }

  const año = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);
  if (!esFechaCalendarioValida(año, mes, dia)) {
    throw new RangeError('La fecha no es un día válido del calendario');
  }

  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
    return formatearFechaManual(fecha);
  }

  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(Date.UTC(año, mes - 1, dia)));
}

export function mesDeFecha(fecha: string): Mes {
  const coincidencia = FECHA_ISO.exec(fecha);
  if (!coincidencia) {
    throw new RangeError('La fecha debe tener el formato AAAA-MM-DD');
  }
  return mesSchema.parse(`${coincidencia[1]}-${coincidencia[2]}`);
}

export function rangoDelMes(mes: Mes): { desde: string; hasta: string } {
  const parseado = mesSchema.parse(mes);
  const [añoTexto, mesTexto] = parseado.split('-') as [string, string];
  const año = Number(añoTexto);
  const mesNumero = Number(mesTexto);
  const ultimoDia = new Date(Date.UTC(año, mesNumero, 0)).getUTCDate();
  return {
    desde: `${parseado}-01`,
    hasta: `${parseado}-${String(ultimoDia).padStart(2, '0')}`,
  };
}

export function mesAnterior(mes: Mes): Mes {
  const parseado = mesSchema.parse(mes);
  const [añoTexto, mesTexto] = parseado.split('-') as [string, string];
  const fecha = new Date(Date.UTC(Number(añoTexto), Number(mesTexto) - 2, 1));
  return mesSchema.parse(
    `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, '0')}`,
  );
}

export function mesSiguiente(mes: Mes): Mes {
  const parseado = mesSchema.parse(mes);
  const [añoTexto, mesTexto] = parseado.split('-') as [string, string];
  const fecha = new Date(Date.UTC(Number(añoTexto), Number(mesTexto), 1));
  return mesSchema.parse(
    `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, '0')}`,
  );
}
