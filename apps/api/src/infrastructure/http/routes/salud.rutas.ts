import type { FastifyPluginCallback } from 'fastify';
import type { ObtenerEstadoSalud } from '../../../application/use-cases/obtener-estado-salud.js';

interface OpcionesRutasSalud {
  obtenerEstadoSalud: ObtenerEstadoSalud;
}

export const rutasSalud: FastifyPluginCallback<OpcionesRutasSalud> = (app, opciones, listo) => {
  app.get('/salud', () => opciones.obtenerEstadoSalud.ejecutar());
  listo();
};
