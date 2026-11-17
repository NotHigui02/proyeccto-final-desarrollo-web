import type { FastifyPluginCallback } from 'fastify';
import type { ObtenerResumenMes } from '../../../application/use-cases/obtener-resumen-mes.js';

interface OpcionesRutasResumen {
  obtenerResumenMes: ObtenerResumenMes;
}

export const rutasResumen: FastifyPluginCallback<OpcionesRutasResumen> = (app, opciones, listo) => {
  app.get('/resumen', async (request) => {
    const consulta = request.query as { mes?: string };
    return opciones.obtenerResumenMes.ejecutar(consulta.mes);
  });
  listo();
};
