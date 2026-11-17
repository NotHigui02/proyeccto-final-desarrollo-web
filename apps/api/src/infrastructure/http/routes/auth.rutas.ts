import type { FastifyPluginCallback } from 'fastify';
import type { RequerirUsuario } from '../../../application/ports/requerir-usuario.js';
import type { CerrarSesion } from '../../../application/use-cases/cerrar-sesion.js';
import type { CrearSesion } from '../../../application/use-cases/crear-sesion.js';
import type { ObtenerUsuarioActual } from '../../../application/use-cases/obtener-usuario-actual.js';
import { ErrorNoAutenticado } from '../../../domain/errors/errores-dominio.js';
import { cabeceraBorrarCookieSesion, cabeceraSetCookieSesion } from '../cookie-sesion.js';
import { crearHookRequerirUsuario } from '../hooks/requerir-usuario-hook.js';

interface OpcionesRutasAuth {
  cookieSecure: boolean;
  requerirUsuario: RequerirUsuario;
  crearSesion: CrearSesion;
  cerrarSesion: CerrarSesion;
  obtenerUsuarioActual: ObtenerUsuarioActual;
}

export const rutasAuth: FastifyPluginCallback<OpcionesRutasAuth> = (app, opciones, listo) => {
  const exigirUsuario = crearHookRequerirUsuario(opciones.requerirUsuario);

  app.post('/auth/sesion', async (request, reply) => {
    const cookie = await opciones.crearSesion.ejecutar(request.body);
    return reply
      .header('set-cookie', cabeceraSetCookieSesion(cookie, { secure: opciones.cookieSecure }))
      .status(204)
      .send();
  });

  app.delete('/auth/sesion', async (request, reply) => {
    try {
      await exigirUsuario(request);
      if (request.usuario) {
        await opciones.cerrarSesion.ejecutar(request.usuario);
      }
    } catch (error) {
      if (!(error instanceof ErrorNoAutenticado)) throw error;
    }
    return reply
      .header('set-cookie', cabeceraBorrarCookieSesion(opciones.cookieSecure))
      .status(204)
      .send();
  });

  app.get('/auth/yo', async (request) => {
    await exigirUsuario(request);
    if (!request.usuario) throw new ErrorNoAutenticado();
    return opciones.obtenerUsuarioActual.ejecutar(request.usuario);
  });

  listo();
};
