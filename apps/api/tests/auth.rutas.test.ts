import { describe, expect, it } from 'vitest';
import { ErrorNoAutenticado } from '../src/domain/errors/errores-dominio.js';
import { VerificadorSesionMemoria } from '../src/infrastructure/auth/verificador-sesion-memoria.js';
import { crearAppPrueba, crearAppPruebaConAuth, USUARIO_DEMO, WEB_ORIGIN } from './helpers.js';

const jsonHeaders = {
  origin: WEB_ORIGIN,
  'content-type': 'application/json',
};

describe('rutas de autenticación', () => {
  it('POST /auth/sesion crea cookie con idToken reciente', async () => {
    const verificador = new VerificadorSesionMemoria();
    verificador.registrarIdToken('token-ok', USUARIO_DEMO);
    const app = crearAppPruebaConAuth(verificador);

    const respuesta = await app.inject({
      method: 'POST',
      url: '/api/auth/sesion',
      headers: jsonHeaders,
      payload: { idToken: 'token-ok' },
    });

    expect(respuesta.statusCode).toBe(204);
    expect(respuesta.headers['set-cookie']).toEqual(
      expect.stringContaining('sesion=cookie-token-ok'),
    );
    expect(respuesta.headers['set-cookie']).toEqual(expect.stringContaining('HttpOnly'));
    expect(respuesta.headers['set-cookie']).toEqual(expect.stringContaining('SameSite=Lax'));
  });

  it('POST /auth/sesion rechaza auth_time antiguo', async () => {
    const verificador = new VerificadorSesionMemoria();
    verificador.registrarIdToken('token-viejo', USUARIO_DEMO, Math.floor(Date.now() / 1000) - 600);
    const app = crearAppPruebaConAuth(verificador);

    const respuesta = await app.inject({
      method: 'POST',
      url: '/api/auth/sesion',
      headers: jsonHeaders,
      payload: { idToken: 'token-viejo' },
    });

    expect(respuesta.statusCode).toBe(400);
  });

  it('GET /auth/yo responde 401 sin cookie', async () => {
    const app = crearAppPruebaConAuth();
    const respuesta = await app.inject({ method: 'GET', url: '/api/auth/yo' });
    expect(respuesta.statusCode).toBe(401);
  });

  it('GET /auth/yo acepta Bearer y devuelve el usuario', async () => {
    const app = crearAppPruebaConAuth();
    const respuesta = await app.inject({
      method: 'GET',
      url: '/api/auth/yo',
      headers: { authorization: 'Bearer token-demo' },
    });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json<unknown>()).toEqual({ usuario: USUARIO_DEMO });
  });

  it('GET /auth/yo con cookie inválida responde 401', async () => {
    const app = crearAppPruebaConAuth();
    const respuesta = await app.inject({
      method: 'GET',
      url: '/api/auth/yo',
      headers: { cookie: 'sesion=no-existe' },
    });
    expect(respuesta.statusCode).toBe(401);
  });

  it('rutas privadas responden 401 si requerirUsuario falla', async () => {
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
