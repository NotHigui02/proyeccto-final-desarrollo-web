import type { Dependencias } from './app.js';
import { ObtenerEstadoSalud } from './application/use-cases/obtener-estado-salud.js';
import { RelojSistema } from './infrastructure/reloj/reloj-sistema.js';

export function crearDependencias(): Dependencias {
  const reloj = new RelojSistema();
  return {
    obtenerEstadoSalud: new ObtenerEstadoSalud(reloj),
  };
}
