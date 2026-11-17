import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import type { ObtenerEstadoSalud } from './application/use-cases/obtener-estado-salud.js';
import type { ObtenerResumenMes } from './application/use-cases/obtener-resumen-mes.js';
import type { Entorno } from './infrastructure/config/entorno.js';
import { registrarManejoErrores } from './infrastructure/http/manejo-errores.js';
import { rutasResumen } from './infrastructure/http/routes/resumen.rutas.js';
import { rutasSalud } from './infrastructure/http/routes/salud.rutas.js';

export interface Dependencias {
  obtenerEstadoSalud: ObtenerEstadoSalud;
  obtenerResumenMes: ObtenerResumenMes;
}

export function construirApp(entorno: Entorno, dependencias: Dependencias): FastifyInstance {
  const app = Fastify({
    logger:
      entorno.NODE_ENV === 'test'
        ? false
        : {
            level: entorno.LOG_LEVEL,
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'res.headers["set-cookie"]',
              ],
              censor: '[OCULTO]',
            },
          },
    genReqId: () => randomUUID(),
    requestIdHeader: false,
    bodyLimit: 1_048_576,
  });

  app.addHook('onRequest', (request, reply, listo) => {
    reply.header('x-request-id', request.id);
    reply.header('cache-control', 'no-store');
    listo();
  });

  registrarManejoErrores(app);

  void app.register(rutasSalud, {
    prefix: '/api',
    obtenerEstadoSalud: dependencias.obtenerEstadoSalud,
  });
  void app.register(rutasResumen, {
    prefix: '/api',
    obtenerResumenMes: dependencias.obtenerResumenMes,
  });

  return app;
}
