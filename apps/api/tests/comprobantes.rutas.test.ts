import { describe, expect, it } from 'vitest';
import { ErrorNoAutenticado } from '../src/domain/errors/errores-dominio.js';
import { AlmacenArchivosMemoria } from '../src/infrastructure/memoria/almacen-archivos-memoria.js';
import { UID_DEMO } from '../src/infrastructure/memoria/semilla.js';
import { crearAppPrueba, USUARIO_DEMO, WEB_ORIGIN } from './helpers.js';

const jsonHeaders = {
  origin: WEB_ORIGIN,
  'content-type': 'application/json',
};

const cuerpoMovimiento = {
  tipo: 'gasto',
  montoCentavos: 50_000,
  categoriaId: 'comida',
  nota: null,
  fecha: '2026-11-10',
  comprobanteUrl: null,
};

describe('rutas de comprobantes', () => {
  it('POST upload sin sesión responde 401', async () => {
    const app = crearAppPrueba(undefined, {
      requerirUsuario: {
        ejecutar: () => Promise.reject(new ErrorNoAutenticado()),
      },
    });
    const respuesta = await app.inject({
      method: 'POST',
      url: '/api/comprobantes/upload',
      headers: jsonHeaders,
      payload: {
        type: 'blob.generate-client-token',
        payload: {
          pathname: `usuarios/${USUARIO_DEMO.uid}/comprobantes/factura.pdf`,
          multipart: false,
          clientPayload: null,
        },
      },
    });
    expect(respuesta.statusCode).toBe(401);
  });

  it('POST upload con pathname ajeno responde 403', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'POST',
      url: '/api/comprobantes/upload',
      headers: jsonHeaders,
      payload: {
        type: 'blob.generate-client-token',
        payload: {
          pathname: 'usuarios/otro-uid/comprobantes/factura.pdf',
          multipart: false,
          clientPayload: null,
        },
      },
    });
    expect(respuesta.statusCode).toBe(403);
  });

  it('POST upload con tipo no permitido responde 415', async () => {
    const respuesta = await crearAppPrueba().inject({
      method: 'POST',
      url: '/api/comprobantes/upload',
      headers: jsonHeaders,
      payload: {
        type: 'blob.generate-client-token',
        payload: {
          pathname: `usuarios/${USUARIO_DEMO.uid}/comprobantes/virus.exe`,
          multipart: false,
          clientPayload: null,
        },
      },
    });
    expect(respuesta.statusCode).toBe(415);
  });

  it('flujo registrar + obtener + eliminar comprobante', async () => {
    const almacen = new AlmacenArchivosMemoria();
    const app = crearAppPrueba(undefined, { almacen });

    const creada = await app.inject({
      method: 'POST',
      url: '/api/movimientos',
      headers: jsonHeaders,
      payload: cuerpoMovimiento,
    });
    expect(creada.statusCode).toBe(201);
    const id = creada.json<{ id: string }>().id;
    const pathname = `usuarios/${UID_DEMO}/comprobantes/ticket.pdf`;

    const token = await app.inject({
      method: 'POST',
      url: '/api/comprobantes/upload',
      headers: jsonHeaders,
      payload: {
        type: 'blob.generate-client-token',
        payload: { pathname, multipart: false, clientPayload: null },
      },
    });
    expect(token.statusCode).toBe(200);
    expect(token.json<{ clientToken: string }>().clientToken).toContain('memoria-token');

    const registrada = await app.inject({
      method: 'POST',
      url: `/api/movimientos/${id}/comprobante`,
      headers: jsonHeaders,
      payload: { pathname },
    });
    expect(registrada.statusCode).toBe(200);
    expect(registrada.json<{ comprobanteUrl: string | null }>().comprobanteUrl).toContain(pathname);

    const descarga = await app.inject({
      method: 'GET',
      url: `/api/movimientos/${id}/comprobante`,
    });
    expect(descarga.statusCode).toBe(200);
    expect(descarga.headers['content-type']).toContain('application/pdf');

    const borrada = await app.inject({
      method: 'DELETE',
      url: `/api/movimientos/${id}/comprobante`,
      headers: { origin: WEB_ORIGIN },
    });
    expect(borrada.statusCode).toBe(200);
    expect(borrada.json<{ comprobanteUrl: string | null }>().comprobanteUrl).toBeNull();
  });

  it('POST registrar pathname ajeno responde 403', async () => {
    const app = crearAppPrueba();
    const creada = await app.inject({
      method: 'POST',
      url: '/api/movimientos',
      headers: jsonHeaders,
      payload: cuerpoMovimiento,
    });
    const id = creada.json<{ id: string }>().id;

    const respuesta = await app.inject({
      method: 'POST',
      url: `/api/movimientos/${id}/comprobante`,
      headers: jsonHeaders,
      payload: { pathname: 'usuarios/otro/comprobantes/a.pdf' },
    });
    expect(respuesta.statusCode).toBe(403);
  });
});
