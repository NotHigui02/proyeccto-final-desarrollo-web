import { categoriaEntradaSchema } from '@gastos/shared';
import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';
import type { RequerirUsuario } from '../../../application/ports/requerir-usuario.js';
import type { ActualizarCategoria } from '../../../application/use-cases/actualizar-categoria.js';
import type { CrearCategoria } from '../../../application/use-cases/crear-categoria.js';
import type { EliminarCategoria } from '../../../application/use-cases/eliminar-categoria.js';
import type { ListarCategorias } from '../../../application/use-cases/listar-categorias.js';
import { crearHookRequerirUsuario, uidDePeticion } from '../hooks/requerir-usuario-hook.js';
import { validar } from '../validar.js';

interface OpcionesRutasCategorias {
  requerirUsuario: RequerirUsuario;
  listarCategorias: ListarCategorias;
  crearCategoria: CrearCategoria;
  actualizarCategoria: ActualizarCategoria;
  eliminarCategoria: EliminarCategoria;
}

const paramsIdSchema = z.strictObject({
  id: z.string().min(1),
});

export const rutasCategorias: FastifyPluginCallback<OpcionesRutasCategorias> = (
  app,
  opciones,
  listo,
) => {
  app.addHook('preHandler', crearHookRequerirUsuario(opciones.requerirUsuario));

  app.get('/categorias', async (request) => {
    const items = await opciones.listarCategorias.ejecutar(uidDePeticion(request));
    return { items };
  });

  app.post('/categorias', async (request, reply) => {
    const entrada = validar(categoriaEntradaSchema, request.body);
    const creada = await opciones.crearCategoria.ejecutar(uidDePeticion(request), entrada);
    return reply.status(201).send(creada);
  });

  app.put('/categorias/:id', async (request) => {
    const { id } = validar(paramsIdSchema, request.params);
    const entrada = validar(categoriaEntradaSchema, request.body);
    return opciones.actualizarCategoria.ejecutar(uidDePeticion(request), id, entrada);
  });

  app.delete('/categorias/:id', async (request, reply) => {
    const { id } = validar(paramsIdSchema, request.params);
    await opciones.eliminarCategoria.ejecutar(uidDePeticion(request), id);
    return reply.status(204).send();
  });

  listo();
};
