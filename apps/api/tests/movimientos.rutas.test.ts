import { describe, expect, it } from 'vitest';
import { ErrorNoAutenticado } from '../src/domain/errors/errores-dominio.js';
import { crearAppPrueba, WEB_ORIGIN } from './helpers.js';

const jsonHeaders = {
  origin: WEB_ORIGIN,
  'content-type': 'application/json',
};

const cuerpoValido = {
  tipo: 'gasto',
  montoCentavos: 1_250_000,
  categoriaId: 'comida',
  nota: null,
  fecha: '2026-11-10',
  comprobanteUrl: null,
};

describe('rutas de movimientos', () => {
  it('GET lista movimientos del mes (200)', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'GET',
      url: '/api/movimientos?mes=2026-11&limite=5',
    });
    expect(respuesta.statusCode).toBe(200);
    const cuerpo = respuesta.json<{ items: unknown[]; siguienteCursor: string | null }>();
    expect(cuerpo.items.length).toBeGreaterThan(0);
  });

  it('POST crea movimiento (201)', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'POST',
      url: '/api/movimientos',
      headers: jsonHeaders,
      payload: cuerpoValido,
    });
    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.json<{ montoCentavos: number }>().montoCentavos).toBe(1_250_000);
  });

  it('POST rechaza monto 0 (400)', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'POST',
      url: '/api/movimientos',
      headers: jsonHeaders,
      payload: { ...cuerpoValido, montoCentavos: 0 },
    });
    expect(respuesta.statusCode).toBe(400);
  });

  it('POST rechaza sin sesión (401)', async () => {
    const app = crearAppPrueba(undefined, {
      requerirUsuario: {
        ejecutar: () => Promise.reject(new ErrorNoAutenticado()),
      },
    });
    const respuesta = await app.inject({
      method: 'POST',
      url: '/api/movimientos',
      headers: jsonHeaders,
      payload: cuerpoValido,
    });
    expect(respuesta.statusCode).toBe(401);
  });

  it('GET por id inexistente o ajeno responde 404', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'GET',
      url: '/api/movimientos/no-existe',
    });
    expect(respuesta.statusCode).toBe(404);
  });

  it('integración ruta → caso de uso → repositorio: crea y obtiene', async () => {
    const app = crearAppPrueba();
    const creada = await app.inject({
      method: 'POST',
      url: '/api/movimientos',
      headers: jsonHeaders,
      payload: cuerpoValido,
    });
    const id = creada.json<{ id: string }>().id;
    const obtenida = await app.inject({ method: 'GET', url: `/api/movimientos/${id}` });
    expect(obtenida.statusCode).toBe(200);
    expect(obtenida.json<{ id: string }>().id).toBe(id);
  });

  it('DELETE responde 204', async () => {
    const app = crearAppPrueba();
    const creada = await app.inject({
      method: 'POST',
      url: '/api/movimientos',
      headers: jsonHeaders,
      payload: cuerpoValido,
    });
    const id = creada.json<{ id: string }>().id;
    const borrada = await app.inject({
      method: 'DELETE',
      url: `/api/movimientos/${id}`,
      headers: { origin: WEB_ORIGIN },
    });
    expect(borrada.statusCode).toBe(204);
  });
});
