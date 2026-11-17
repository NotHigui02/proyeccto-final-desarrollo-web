import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ErrorConflicto, ErrorNoAutenticado } from '../src/domain/errors/errores-dominio.js';
import { LimitadorMemoria } from '../src/infrastructure/memoria/limitador-memoria.js';
import { validar } from '../src/infrastructure/http/validar.js';
import { crearAppPrueba, WEB_ORIGIN } from './helpers.js';

describe('GET /api/salud', () => {
  it('responde 200 con el estado, sin caché, id y cabeceras de seguridad', async () => {
    const respuesta = await crearAppPrueba().inject({ method: 'GET', url: '/api/salud' });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json<unknown>()).toEqual({ estado: 'ok', fecha: '2026-11-17T15:00:00.000Z' });
    expect(respuesta.headers['cache-control']).toBe('no-store');
    expect(respuesta.headers['x-request-id']).toEqual(expect.any(String));
    expect(respuesta.headers['x-content-type-options']).toBe('nosniff');
    expect(respuesta.headers['referrer-policy']).toBe('no-referrer');
    expect(respuesta.headers['content-security-policy']).toContain("default-src 'none'");
  });
});

describe('GET /api/resumen', () => {
  it('responde 200 con totales del mes y evolución', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'GET',
      url: '/api/resumen?mes=2026-11',
    });
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
    const respuesta = await crearAppPrueba().inject({
      method: 'GET',
      url: '/api/resumen?mes=2026-13',
    });
    expect(respuesta.statusCode).toBe(400);
    const cuerpo = respuesta.json<{ error: string; detalles: { campo: string }[] }>();
    expect(cuerpo.error).toBe('Datos inválidos');
    expect(cuerpo.detalles.map((detalle) => detalle.campo)).toEqual(['mes']);
  });

  it('responde 401 sin sesión', async () => {
    const app = crearAppPrueba(undefined, {
      requerirUsuario: {
        ejecutar: () => Promise.reject(new ErrorNoAutenticado()),
      },
    });
    const respuesta = await app.inject({
      method: 'GET',
      url: '/api/resumen?mes=2026-11',
    });
    expect(respuesta.statusCode).toBe(401);
  });
});

describe('seguridad HTTP', () => {
  it('rechaza Origen distinto en mutaciones (403)', async () => {
    const app = crearAppPrueba();
    app.post('/api/prueba', () => ({ ok: true }));

    const respuesta = await app.inject({
      method: 'POST',
      url: '/api/prueba',
      headers: {
        origin: 'https://evil.example',
        'content-type': 'application/json',
      },
      payload: {},
    });

    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.json<unknown>()).toEqual({ error: 'Origen no permitido' });
  });

  it('rechaza Content-Type no JSON en mutaciones (415)', async () => {
    const app = crearAppPrueba();
    app.post('/api/prueba', () => ({ ok: true }));

    const respuesta = await app.inject({
      method: 'POST',
      url: '/api/prueba',
      headers: {
        origin: WEB_ORIGIN,
        'content-type': 'text/plain',
      },
      payload: 'hola',
    });

    expect(respuesta.statusCode).toBe(415);
    expect(respuesta.json<unknown>()).toEqual({
      error: 'Content-Type no permitido; use application/json',
    });
  });

  it('rechaza cuerpos demasiado grandes (413)', async () => {
    const app = crearAppPrueba();
    app.post('/api/prueba', () => ({ ok: true }));
    const cuerpo = 'x'.repeat(1_048_576 + 1);

    const respuesta = await app.inject({
      method: 'POST',
      url: '/api/prueba',
      headers: {
        origin: WEB_ORIGIN,
        'content-type': 'application/json',
      },
      payload: `"${cuerpo}"`,
    });

    expect(respuesta.statusCode).toBe(413);
    expect(respuesta.json<unknown>()).toEqual({
      error: 'El cuerpo de la petición es demasiado grande',
    });
  });

  it('limita la frecuencia de escrituras (429)', async () => {
    const limitador = new LimitadorMemoria(1, 60_000);
    const app = crearAppPrueba(limitador);
    app.post('/api/prueba', () => ({ ok: true }));

    const cabeceras = { origin: WEB_ORIGIN, 'content-type': 'application/json' };
    const primera = await app.inject({
      method: 'POST',
      url: '/api/prueba',
      headers: cabeceras,
      payload: {},
    });
    const segunda = await app.inject({
      method: 'POST',
      url: '/api/prueba',
      headers: cabeceras,
      payload: {},
    });

    expect(primera.statusCode).toBe(200);
    expect(segunda.statusCode).toBe(429);
    expect(segunda.json<unknown>()).toEqual({ error: 'Demasiadas solicitudes' });
    expect(segunda.headers['retry-after']).toBeDefined();
  });

  it('permite el origen de la web en CORS', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'GET',
      url: '/api/salud',
      headers: { origin: WEB_ORIGIN },
    });

    expect(respuesta.headers['access-control-allow-origin']).toBe(WEB_ORIGIN);
    expect(respuesta.headers['access-control-allow-credentials']).toBe('true');
  });
});

describe('validar', () => {
  it('devuelve el valor tipado o lanza ZodError', () => {
    const esquema = z.strictObject({ monto: z.number().int().positive() });
    expect(validar(esquema, { monto: 10 })).toEqual({ monto: 10 });
    expect(() => validar(esquema, { monto: 0 })).toThrow();
  });
});

describe('manejo de errores', () => {
  it('responde 404 con el formato común', async () => {
    const respuesta = await crearAppPrueba().inject({ method: 'GET', url: '/api/no-existe' });

    expect(respuesta.statusCode).toBe(404);
    expect(respuesta.json<unknown>()).toEqual({ error: 'Recurso no encontrado' });
  });

  it('convierte un error de Zod en 400 con detalle por campo', async () => {
    const app = crearAppPrueba();
    app.post('/api/prueba', (request) => z.strictObject({ monto: z.number() }).parse(request.body));

    const respuesta = await app.inject({
      method: 'POST',
      url: '/api/prueba',
      headers: { origin: WEB_ORIGIN, 'content-type': 'application/json' },
      payload: { monto: 'x' },
    });

    const cuerpo = respuesta.json<{ error: string; detalles: { campo: string }[] }>();
    expect(respuesta.statusCode).toBe(400);
    expect(cuerpo.error).toBe('Datos inválidos');
    expect(cuerpo.detalles.map((detalle) => detalle.campo)).toEqual(['monto']);
  });

  it('convierte un error de dominio en su código HTTP', async () => {
    const app = crearAppPrueba();
    app.get('/api/prueba', () => {
      throw new ErrorConflicto('La categoría ya existe');
    });

    const respuesta = await app.inject({ method: 'GET', url: '/api/prueba' });

    expect(respuesta.statusCode).toBe(409);
    expect(respuesta.json<unknown>()).toEqual({ error: 'La categoría ya existe' });
  });

  it('oculta los detalles de un error inesperado', async () => {
    const app = crearAppPrueba();
    app.get('/api/prueba', () => {
      throw new Error('detalle interno sensible');
    });

    const respuesta = await app.inject({ method: 'GET', url: '/api/prueba' });

    expect(respuesta.statusCode).toBe(500);
    expect(respuesta.json<unknown>()).toEqual({ error: 'Error interno del servidor' });
  });
});
