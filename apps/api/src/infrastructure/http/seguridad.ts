import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { LimitadorFrecuencia } from '../../application/ports/limitador-frecuencia.js';
import type { Entorno } from '../config/entorno.js';

const METODOS_MUTACION = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function esMutacion(metodo: string): boolean {
  return METODOS_MUTACION.has(metodo.toUpperCase());
}

function claveCliente(request: FastifyRequest): string {
  const reenviado = request.headers['x-forwarded-for'];
  if (typeof reenviado === 'string' && reenviado.trim() !== '') {
    return reenviado.split(',')[0]?.trim() ?? request.ip;
  }
  return request.ip;
}

export function registrarSeguridad(
  app: FastifyInstance,
  entorno: Entorno,
  limitador: LimitadorFrecuencia,
): void {
  app.addHook('onRequest', (request, reply, listo) => {
    reply.header('x-content-type-options', 'nosniff');
    reply.header('referrer-policy', 'no-referrer');
    reply.header('content-security-policy', "default-src 'none'; frame-ancestors 'none'");
    reply.header('x-frame-options', 'DENY');

    const origen = request.headers.origin;
    if (origen === entorno.WEB_ORIGIN) {
      reply.header('access-control-allow-origin', entorno.WEB_ORIGIN);
      reply.header('access-control-allow-credentials', 'true');
      reply.header('vary', 'Origin');
    }

    listo();
  });

  app.addHook('preHandler', (request, reply, listo) => {
    if (!esMutacion(request.method)) {
      listo();
      return;
    }

    const origen = request.headers.origin;
    if (origen !== undefined && origen !== entorno.WEB_ORIGIN) {
      void reply.status(403).send({ error: 'Origen no permitido' });
      return;
    }

    const tipo = request.headers['content-type'];
    const tieneCuerpo = request.method !== 'DELETE';
    if (
      tieneCuerpo &&
      (typeof tipo !== 'string' || !tipo.toLowerCase().includes('application/json'))
    ) {
      void reply.status(415).send({ error: 'Content-Type no permitido; use application/json' });
      return;
    }

    void limitador.intentar(claveCliente(request)).then((resultado) => {
      if (!resultado.permitido) {
        if (resultado.reintentarEnSegundos !== undefined) {
          reply.header('retry-after', String(resultado.reintentarEnSegundos));
        }
        void reply.status(429).send({ error: 'Demasiadas solicitudes' });
        return;
      }
      listo();
    });
  });
}
