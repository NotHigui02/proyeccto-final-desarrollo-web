import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import type { LimitadorFrecuencia } from './application/ports/limitador-frecuencia.js';
import type { ActualizarCategoria } from './application/use-cases/actualizar-categoria.js';
import type { CrearCategoria } from './application/use-cases/crear-categoria.js';
import type { EliminarCategoria } from './application/use-cases/eliminar-categoria.js';
import type { ListarCategorias } from './application/use-cases/listar-categorias.js';
import type { ObtenerEstadoSalud } from './application/use-cases/obtener-estado-salud.js';
import type { ObtenerResumenMes } from './application/use-cases/obtener-resumen-mes.js';
import type { Entorno } from './infrastructure/config/entorno.js';
import { registrarManejoErrores } from './infrastructure/http/manejo-errores.js';
import { rutasCategorias } from './infrastructure/http/routes/categorias.rutas.js';
import { rutasResumen } from './infrastructure/http/routes/resumen.rutas.js';
import { rutasSalud } from './infrastructure/http/routes/salud.rutas.js';
import { registrarSeguridad } from './infrastructure/http/seguridad.js';

export interface Dependencias {
  uid: string;
  obtenerEstadoSalud: ObtenerEstadoSalud;
  obtenerResumenMes: ObtenerResumenMes;
  listarCategorias: ListarCategorias;
  crearCategoria: CrearCategoria;
  actualizarCategoria: ActualizarCategoria;
  eliminarCategoria: EliminarCategoria;
  limitadorFrecuencia: LimitadorFrecuencia;
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

  registrarSeguridad(app, entorno, dependencias.limitadorFrecuencia);
  registrarManejoErrores(app);

  void app.register(rutasSalud, {
    prefix: '/api',
    obtenerEstadoSalud: dependencias.obtenerEstadoSalud,
  });
  void app.register(rutasResumen, {
    prefix: '/api',
    obtenerResumenMes: dependencias.obtenerResumenMes,
  });
  void app.register(rutasCategorias, {
    prefix: '/api',
    uid: dependencias.uid,
    listarCategorias: dependencias.listarCategorias,
    crearCategoria: dependencias.crearCategoria,
    actualizarCategoria: dependencias.actualizarCategoria,
    eliminarCategoria: dependencias.eliminarCategoria,
  });

  return app;
}
