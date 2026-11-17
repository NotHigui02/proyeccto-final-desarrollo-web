import { mesSchema } from '@gastos/shared';
import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';
import type { RequerirUsuario } from '../../../application/ports/requerir-usuario.js';
import type { GuardarPresupuesto } from '../../../application/use-cases/guardar-presupuesto.js';
import type { ObtenerPresupuesto } from '../../../application/use-cases/obtener-presupuesto.js';
import { crearHookRequerirUsuario, uidDePeticion } from '../hooks/requerir-usuario-hook.js';
import { validar } from '../validar.js';

interface OpcionesRutasPresupuestos {
  requerirUsuario: RequerirUsuario;
  obtenerPresupuesto: ObtenerPresupuesto;
  guardarPresupuesto: GuardarPresupuesto;
}

const paramsMesSchema = z.strictObject({
  mes: mesSchema,
});

export const rutasPresupuestos: FastifyPluginCallback<OpcionesRutasPresupuestos> = (
  app,
  opciones,
  listo,
) => {
  app.addHook('preHandler', crearHookRequerirUsuario(opciones.requerirUsuario));

  app.get('/presupuestos/:mes', async (request) => {
    const { mes } = validar(paramsMesSchema, request.params);
    return opciones.obtenerPresupuesto.ejecutar(uidDePeticion(request), mes);
  });

  app.put('/presupuestos/:mes', async (request) => {
    const { mes } = validar(paramsMesSchema, request.params);
    return opciones.guardarPresupuesto.ejecutar(uidDePeticion(request), mes, request.body);
  });

  listo();
};
