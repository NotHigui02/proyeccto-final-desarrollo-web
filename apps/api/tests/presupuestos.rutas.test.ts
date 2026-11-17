import { describe, expect, it } from 'vitest';
import { ErrorNoAutenticado } from '../src/domain/errors/errores-dominio.js';
import { crearAppPrueba, WEB_ORIGIN } from './helpers.js';

const jsonHeaders = {
  origin: WEB_ORIGIN,
  'content-type': 'application/json',
};

describe('rutas de presupuestos', () => {
  it('PUT crea o reemplaza y GET lo devuelve', async () => {
    const app = crearAppPrueba();

    const guardado = await app.inject({
      method: 'PUT',
      url: '/api/presupuestos/2026-11',
      headers: jsonHeaders,
      payload: { montoCentavos: 2_000_000 },
    });
    expect(guardado.statusCode).toBe(200);
    expect(guardado.json<unknown>()).toEqual({
      mes: '2026-11',
      montoCentavos: 2_000_000,
    });

    const obtenido = await app.inject({
      method: 'GET',
      url: '/api/presupuestos/2026-11',
    });
    expect(obtenido.statusCode).toBe(200);
    expect(obtenido.json<unknown>()).toEqual({
      mes: '2026-11',
      montoCentavos: 2_000_000,
    });
  });

  it('GET responde 404 si no hay presupuesto', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'GET',
      url: '/api/presupuestos/2026-01',
    });
    expect(respuesta.statusCode).toBe(404);
  });

  it('PUT responde 400 con monto inválido', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'PUT',
      url: '/api/presupuestos/2026-11',
      headers: jsonHeaders,
      payload: { montoCentavos: 0 },
    });
    expect(respuesta.statusCode).toBe(400);
  });

  it('rechaza sin sesión (401)', async () => {
    const app = crearAppPrueba(undefined, {
      requerirUsuario: {
        ejecutar: () => Promise.reject(new ErrorNoAutenticado()),
      },
    });
    const respuesta = await app.inject({
      method: 'GET',
      url: '/api/presupuestos/2026-11',
    });
    expect(respuesta.statusCode).toBe(401);
  });

  it('incluye el presupuesto en el resumen', async () => {
    const app = crearAppPrueba();
    await app.inject({
      method: 'PUT',
      url: '/api/presupuestos/2026-11',
      headers: jsonHeaders,
      payload: { montoCentavos: 3_000_000 },
    });
    const resumen = await app.inject({
      method: 'GET',
      url: '/api/resumen?mes=2026-11',
    });
    expect(resumen.statusCode).toBe(200);
    expect(resumen.json<{ presupuesto: unknown }>().presupuesto).toEqual({
      mes: '2026-11',
      montoCentavos: 3_000_000,
    });
  });
});
