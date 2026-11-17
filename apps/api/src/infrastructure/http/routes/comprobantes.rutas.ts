import type { FastifyPluginCallback } from 'fastify';
import type { RequerirUsuario } from '../../../application/ports/requerir-usuario.js';
import type { AutorizarSubidaComprobante } from '../../../application/use-cases/autorizar-subida-comprobante.js';
import type { EliminarComprobante } from '../../../application/use-cases/eliminar-comprobante.js';
import type { ObtenerComprobante } from '../../../application/use-cases/obtener-comprobante.js';
import type { RegistrarComprobante } from '../../../application/use-cases/registrar-comprobante.js';
import { crearHookRequerirUsuario, uidDePeticion } from '../hooks/requerir-usuario-hook.js';
import { validar } from '../validar.js';
import { z } from 'zod';

interface OpcionesRutasComprobantes {
  requerirUsuario: RequerirUsuario;
  autorizarSubidaComprobante: AutorizarSubidaComprobante;
  registrarComprobante: RegistrarComprobante;
  obtenerComprobante: ObtenerComprobante;
  eliminarComprobante: EliminarComprobante;
}

const paramsIdSchema = z.strictObject({
  id: z.string().min(1),
});

function peticionComoRequest(request: {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}): Request {
  const cabeceras = new Headers();
  for (const [clave, valor] of Object.entries(request.headers)) {
    if (typeof valor === 'string') cabeceras.set(clave, valor);
    else if (Array.isArray(valor)) {
      for (const item of valor) cabeceras.append(clave, item);
    }
  }
  const origen = cabeceras.get('origin') ?? 'http://127.0.0.1';
  return new Request(new URL(request.url, origen).toString(), {
    method: request.method,
    headers: cabeceras,
    body:
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : JSON.stringify(request.body),
  });
}

export const rutasComprobantes: FastifyPluginCallback<OpcionesRutasComprobantes> = (
  app,
  opciones,
  listo,
) => {
  app.addHook('preHandler', crearHookRequerirUsuario(opciones.requerirUsuario));

  app.post('/comprobantes/upload', async (request) => {
    return opciones.autorizarSubidaComprobante.ejecutar(
      uidDePeticion(request),
      request.body,
      peticionComoRequest(request),
    );
  });

  app.post('/movimientos/:id/comprobante', async (request, reply) => {
    const { id } = validar(paramsIdSchema, request.params);
    const movimiento = await opciones.registrarComprobante.ejecutar(
      uidDePeticion(request),
      id,
      request.body,
    );
    return reply.status(200).send(movimiento);
  });

  app.get('/movimientos/:id/comprobante', async (request, reply) => {
    const { id } = validar(paramsIdSchema, request.params);
    const archivo = await opciones.obtenerComprobante.ejecutar(uidDePeticion(request), id);
    return reply
      .header('content-type', archivo.contentType)
      .header('content-disposition', archivo.contentDisposition)
      .send(archivo.cuerpo);
  });

  app.delete('/movimientos/:id/comprobante', async (request) => {
    const { id } = validar(paramsIdSchema, request.params);
    return opciones.eliminarComprobante.ejecutar(uidDePeticion(request), id);
  });

  listo();
};
