import { mesSchema } from '@gastos/shared';
import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';
import type { RequerirUsuario } from '../../../application/ports/requerir-usuario.js';
import type { ObtenerResumenMes } from '../../../application/use-cases/obtener-resumen-mes.js';
import { crearHookRequerirUsuario, uidDePeticion } from '../hooks/requerir-usuario-hook.js';
import { validar } from '../validar.js';

interface OpcionesRutasResumen {
  requerirUsuario: RequerirUsuario;
  obtenerResumenMes: ObtenerResumenMes;
}

const consultaResumenSchema = z.strictObject({
  mes: mesSchema,
});

export const rutasResumen: FastifyPluginCallback<OpcionesRutasResumen> = (app, opciones, listo) => {
  app.addHook('preHandler', crearHookRequerirUsuario(opciones.requerirUsuario));

  app.get('/resumen', async (request) => {
    const { mes } = validar(consultaResumenSchema, request.query);
    return opciones.obtenerResumenMes.ejecutar(uidDePeticion(request), mes);
  });

  listo();
};
