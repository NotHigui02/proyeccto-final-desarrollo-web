import { describe, expect, it } from 'vitest';
import { ErrorNoAutenticado } from '../src/domain/errors/errores-dominio.js';
import { crearAppPrueba } from './helpers.js';

describe('GET /api/movimientos/exportar', () => {
  it('responde 200 con CSV y cabeceras de descarga', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'GET',
      url: '/api/movimientos/exportar?mes=2026-11',
    });

    expect(respuesta.statusCode).toBe(200);
    expect(String(respuesta.headers['content-type'])).toContain('text/csv');
    expect(respuesta.headers['content-disposition']).toBe(
      'attachment; filename="movimientos-2026-11.csv"',
    );
    expect(respuesta.body.startsWith('\uFEFF')).toBe(true);
    expect(respuesta.body).toContain('montoCentavos;montoCOP');
  });

  it('responde 400 con mes inválido', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'GET',
      url: '/api/movimientos/exportar?mes=2026-13',
    });
    expect(respuesta.statusCode).toBe(400);
  });

  it('responde 401 sin sesión', async () => {
    const app = crearAppPrueba(undefined, {
      requerirUsuario: {
        ejecutar: () => Promise.reject(new ErrorNoAutenticado()),
      },
    });
    const respuesta = await app.inject({
      method: 'GET',
      url: '/api/movimientos/exportar?mes=2026-11',
    });
    expect(respuesta.statusCode).toBe(401);
  });
});
