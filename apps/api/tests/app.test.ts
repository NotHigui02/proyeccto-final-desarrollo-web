import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { construirApp } from '../src/app.js';
import type { Reloj } from '../src/application/ports/reloj.js';
import { ObtenerEstadoSalud } from '../src/application/use-cases/obtener-estado-salud.js';
import { ObtenerResumenMes } from '../src/application/use-cases/obtener-resumen-mes.js';
import { ErrorConflicto } from '../src/domain/errors/errores-dominio.js';
import { cargarEntorno } from '../src/infrastructure/config/entorno.js';
import { RepositorioDatosEjemplo } from '../src/infrastructure/memoria/datos-ejemplo.js';

const relojFijo: Reloj = { ahora: () => new Date('2026-11-17T15:00:00.000Z') };

function crearApp() {
  return construirApp(cargarEntorno({ NODE_ENV: 'test' }), {
    obtenerEstadoSalud: new ObtenerEstadoSalud(relojFijo),
    obtenerResumenMes: new ObtenerResumenMes(new RepositorioDatosEjemplo()),
  });
}

describe('GET /api/salud', () => {
  it('responde 200 con el estado, sin caché y con id de petición', async () => {
    const respuesta = await crearApp().inject({ method: 'GET', url: '/api/salud' });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json<unknown>()).toEqual({ estado: 'ok', fecha: '2026-11-17T15:00:00.000Z' });
    expect(respuesta.headers['cache-control']).toBe('no-store');
    expect(respuesta.headers['x-request-id']).toEqual(expect.any(String));
  });
});

describe('GET /api/resumen', () => {
  it('responde 200 con totales del mes y evolución', async () => {
    const respuesta = await crearApp().inject({ method: 'GET', url: '/api/resumen?mes=2026-11' });
    const cuerpo = respuesta.json<{
      mes: string;
      ingresosCentavos: number;
      gastosCentavos: number;
      saldoCentavos: number;
      porCategoria: unknown[];
      evolucion: unknown[];
    }>();

    expect(respuesta.statusCode).toBe(200);
    expect(cuerpo.mes).toBe('2026-11');
    expect(cuerpo.ingresosCentavos).toBe(3_000_000);
    expect(cuerpo.gastosCentavos).toBe(2_500_000);
    expect(cuerpo.saldoCentavos).toBe(500_000);
    expect(cuerpo.porCategoria).toHaveLength(3);
    expect(cuerpo.evolucion).toHaveLength(6);
  });

  it('responde 400 si el mes es inválido', async () => {
    const respuesta = await crearApp().inject({ method: 'GET', url: '/api/resumen?mes=2026-13' });
    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.json<unknown>()).toEqual({
      error: 'Mes inválido',
      detalles: [{ campo: 'mes', mensaje: 'El mes debe tener el formato AAAA-MM' }],
    });
  });
});

describe('manejo de errores', () => {
  it('responde 404 con el formato común', async () => {
    const respuesta = await crearApp().inject({ method: 'GET', url: '/api/no-existe' });

    expect(respuesta.statusCode).toBe(404);
    expect(respuesta.json<unknown>()).toEqual({ error: 'Recurso no encontrado' });
  });

  it('convierte un error de Zod en 400 con detalle por campo', async () => {
    const app = crearApp();
    app.post('/api/prueba', (request) => z.strictObject({ monto: z.number() }).parse(request.body));

    const respuesta = await app.inject({
      method: 'POST',
      url: '/api/prueba',
      payload: { monto: 'x' },
    });

    const cuerpo = respuesta.json<{ error: string; detalles: { campo: string }[] }>();
    expect(respuesta.statusCode).toBe(400);
    expect(cuerpo.error).toBe('Datos inválidos');
    expect(cuerpo.detalles.map((detalle) => detalle.campo)).toEqual(['monto']);
  });

  it('convierte un error de dominio en su código HTTP', async () => {
    const app = crearApp();
    app.get('/api/prueba', () => {
      throw new ErrorConflicto('La categoría ya existe');
    });

    const respuesta = await app.inject({ method: 'GET', url: '/api/prueba' });

    expect(respuesta.statusCode).toBe(409);
    expect(respuesta.json<unknown>()).toEqual({ error: 'La categoría ya existe' });
  });

  it('oculta los detalles de un error inesperado', async () => {
    const app = crearApp();
    app.get('/api/prueba', () => {
      throw new Error('detalle interno sensible');
    });

    const respuesta = await app.inject({ method: 'GET', url: '/api/prueba' });

    expect(respuesta.statusCode).toBe(500);
    expect(respuesta.json<unknown>()).toEqual({ error: 'Error interno del servidor' });
  });
});
