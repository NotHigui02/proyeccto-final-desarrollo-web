import { mesSchema } from '@gastos/shared';
import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';
import type { ObtenerResumenMes } from '../../../application/use-cases/obtener-resumen-mes.js';
import { validar } from '../validar.js';

interface OpcionesRutasResumen {
  obtenerResumenMes: ObtenerResumenMes;
}

const consultaResumenSchema = z.strictObject({
  mes: mesSchema,
});

export const rutasResumen: FastifyPluginCallback<OpcionesRutasResumen> = (app, opciones, listo) => {
  app.get('/resumen', async (request) => {
    const { mes } = validar(consultaResumenSchema, request.query);
    return opciones.obtenerResumenMes.ejecutar(mes);
  });
  listo();
};
