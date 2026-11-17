import { mesSchema, tipoMovimientoSchema } from '@gastos/shared';
import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';
import type { RequerirUsuario } from '../../../application/ports/requerir-usuario.js';
import type { ActualizarMovimiento } from '../../../application/use-cases/actualizar-movimiento.js';
import type { CrearMovimiento } from '../../../application/use-cases/crear-movimiento.js';
import type { EliminarMovimiento } from '../../../application/use-cases/eliminar-movimiento.js';
import type { ExportarMovimientosMes } from '../../../application/use-cases/exportar-movimientos-mes.js';
import type { ListarMovimientos } from '../../../application/use-cases/listar-movimientos.js';
import type { ObtenerMovimiento } from '../../../application/use-cases/obtener-movimiento.js';
import { crearHookRequerirUsuario, uidDePeticion } from '../hooks/requerir-usuario-hook.js';
import { validar } from '../validar.js';

interface OpcionesRutasMovimientos {
  requerirUsuario: RequerirUsuario;
  listarMovimientos: ListarMovimientos;
  obtenerMovimiento: ObtenerMovimiento;
  crearMovimiento: CrearMovimiento;
  actualizarMovimiento: ActualizarMovimiento;
  eliminarMovimiento: EliminarMovimiento;
  exportarMovimientosMes: ExportarMovimientosMes;
}

const paramsIdSchema = z.strictObject({
  id: z.string().min(1),
});

const consultaListaSchema = z.strictObject({
  mes: mesSchema.optional(),
  tipo: tipoMovimientoSchema.optional(),
  categoriaId: z.string().min(1).optional(),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
});

const consultaExportarSchema = z.strictObject({
  mes: mesSchema,
});

export const rutasMovimientos: FastifyPluginCallback<OpcionesRutasMovimientos> = (
  app,
  opciones,
  listo,
) => {
  app.addHook('preHandler', crearHookRequerirUsuario(opciones.requerirUsuario));

  app.get('/movimientos', async (request) => {
    const consulta = validar(consultaListaSchema, request.query);
    const { limite, cursor, mes, tipo, categoriaId } = consulta;
    return opciones.listarMovimientos.ejecutar(
      uidDePeticion(request),
      { mes, tipo, categoriaId },
      { limite, cursor },
    );
  });

  app.get('/movimientos/exportar', async (request, reply) => {
    const { mes } = validar(consultaExportarSchema, request.query);
    const { csv, nombreArchivo } = await opciones.exportarMovimientosMes.ejecutar(
      uidDePeticion(request),
      mes,
    );
    return reply
      .header('content-type', 'text/csv; charset=utf-8')
      .header('content-disposition', `attachment; filename="${nombreArchivo}"`)
      .send(csv);
  });

  app.get('/movimientos/:id', async (request) => {
    const { id } = validar(paramsIdSchema, request.params);
    return opciones.obtenerMovimiento.ejecutar(uidDePeticion(request), id);
  });

  app.post('/movimientos', async (request, reply) => {
    const creado = await opciones.crearMovimiento.ejecutar(uidDePeticion(request), request.body);
    return reply.status(201).send(creado);
  });

  app.put('/movimientos/:id', async (request) => {
    const { id } = validar(paramsIdSchema, request.params);
    return opciones.actualizarMovimiento.ejecutar(uidDePeticion(request), id, request.body);
  });

  app.delete('/movimientos/:id', async (request, reply) => {
    const { id } = validar(paramsIdSchema, request.params);
    await opciones.eliminarMovimiento.ejecutar(uidDePeticion(request), id);
    return reply.status(204).send();
  });

  listo();
};
