import { describe, expect, it } from 'vitest';
import { crearAppPrueba, WEB_ORIGIN } from './helpers.js';

const jsonHeaders = {
  origin: WEB_ORIGIN,
  'content-type': 'application/json',
};

describe('rutas de categorías', () => {
  it('GET lista categorías (200)', async () => {
    const respuesta = await crearAppPrueba().inject({ method: 'GET', url: '/api/categorias' });
    expect(respuesta.statusCode).toBe(200);
    const cuerpo = respuesta.json<{ items: { id: string }[] }>();
    expect(cuerpo.items.length).toBeGreaterThan(0);
  });

  it('POST crea categoría (201)', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'POST',
      url: '/api/categorias',
      headers: jsonHeaders,
      payload: { nombre: 'Mascotas', color: '#0EA5E9' },
    });
    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.json<{ nombre: string }>()).toMatchObject({
      nombre: 'Mascotas',
      color: '#0EA5E9',
    });
  });

  it('POST rechaza datos inválidos (400)', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'POST',
      url: '/api/categorias',
      headers: jsonHeaders,
      payload: { nombre: '', color: 'rojo' },
    });
    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.json<{ error: string }>().error).toBe('Datos inválidos');
  });

  it('POST rechaza nombre duplicado (409)', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'POST',
      url: '/api/categorias',
      headers: jsonHeaders,
      payload: { nombre: 'Comida', color: '#E11D48' },
    });
    expect(respuesta.statusCode).toBe(409);
  });

  it('PUT actualiza (200) y falla si no existe (404)', async () => {
    const app = crearAppPrueba();
    const ok = await app.inject({
      method: 'PUT',
      url: '/api/categorias/comida',
      headers: jsonHeaders,
      payload: { nombre: 'Alimentos', color: '#E11D48' },
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.json<{ nombre: string }>().nombre).toBe('Alimentos');

    const missing = await app.inject({
      method: 'PUT',
      url: '/api/categorias/no-existe',
      headers: jsonHeaders,
      payload: { nombre: 'X', color: '#000000' },
    });
    expect(missing.statusCode).toBe(404);
  });

  it('DELETE falla con movimientos (409) y borra sin ellos (204)', async () => {
    const app = crearAppPrueba();
    const conMovimientos = await app.inject({
      method: 'DELETE',
      url: '/api/categorias/comida',
      headers: { origin: WEB_ORIGIN },
    });
    expect(conMovimientos.statusCode).toBe(409);

    const creada = await app.inject({
      method: 'POST',
      url: '/api/categorias',
      headers: jsonHeaders,
      payload: { nombre: 'Temporal', color: '#ABCDEF' },
    });
    const id = creada.json<{ id: string }>().id;
    const borrada = await app.inject({
      method: 'DELETE',
      url: `/api/categorias/${id}`,
      headers: { origin: WEB_ORIGIN },
    });
    expect(borrada.statusCode).toBe(204);
  });
});
