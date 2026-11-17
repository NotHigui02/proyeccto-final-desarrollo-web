import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { construirApp } from '../src/app.js';
import type { Reloj } from '../src/application/ports/reloj.js';
import { ObtenerEstadoSalud } from '../src/application/use-cases/obtener-estado-salud.js';
import { ErrorConflicto } from '../src/domain/errors/errores-dominio.js';
import { cargarEntorno } from '../src/infrastructure/config/entorno.js';

const relojFijo: Reloj = { ahora: () => new Date('2026-11-17T15:00:00.000Z') };

function crearApp() {
  return construirApp(cargarEntorno({ NODE_ENV: 'test' }), {
    obtenerEstadoSalud: new ObtenerEstadoSalud(relojFijo),
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
