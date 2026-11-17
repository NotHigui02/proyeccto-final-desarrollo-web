import { mesSchema } from '@gastos/shared';
import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';
import type { RequerirUsuario } from '../../../application/ports/requerir-usuario.js';
import type { ObtenerResumenMes } from '../../../application/use-cases/obtener-resumen-mes.js';
import { validar } from '../validar.js';

interface OpcionesRutasResumen {
  uid: string;
  requerirUsuario: RequerirUsuario;
  obtenerResumenMes: ObtenerResumenMes;
}

const consultaResumenSchema = z.strictObject({
  mes: mesSchema,
});

export const rutasResumen: FastifyPluginCallback<OpcionesRutasResumen> = (app, opciones, listo) => {
  app.addHook('preHandler', async () => {
    await opciones.requerirUsuario.ejecutar();
  });

  app.get('/resumen', async (request) => {
    const { mes } = validar(consultaResumenSchema, request.query);
    return opciones.obtenerResumenMes.ejecutar(opciones.uid, mes);
  });

  listo();
};
