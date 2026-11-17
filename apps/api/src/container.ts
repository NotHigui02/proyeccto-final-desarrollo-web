import type { Dependencias } from './app.js';
import { ObtenerEstadoSalud } from './application/use-cases/obtener-estado-salud.js';
import { ObtenerResumenMes } from './application/use-cases/obtener-resumen-mes.js';
import { RepositorioDatosEjemplo } from './infrastructure/memoria/datos-ejemplo.js';
import { RelojSistema } from './infrastructure/reloj/reloj-sistema.js';

export function crearDependencias(): Dependencias {
  const reloj = new RelojSistema();
  const datos = new RepositorioDatosEjemplo();
  return {
    obtenerEstadoSalud: new ObtenerEstadoSalud(reloj),
    obtenerResumenMes: new ObtenerResumenMes(datos),
  };
}
