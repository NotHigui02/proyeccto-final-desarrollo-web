import type { Dependencias } from './app.js';
import { ObtenerEstadoSalud } from './application/use-cases/obtener-estado-salud.js';
import { ObtenerResumenMes } from './application/use-cases/obtener-resumen-mes.js';
import { RepositorioDatosEjemplo } from './infrastructure/memoria/datos-ejemplo.js';
import { LimitadorMemoria } from './infrastructure/memoria/limitador-memoria.js';
import { RelojSistema } from './infrastructure/reloj/reloj-sistema.js';

/** Hasta 60 escrituras por IP cada minuto (plan Hobby / abuso básico). */
const ESCRITURAS_POR_MINUTO = 60;

export function crearDependencias(): Dependencias {
  const reloj = new RelojSistema();
  const datos = new RepositorioDatosEjemplo();
  return {
    obtenerEstadoSalud: new ObtenerEstadoSalud(reloj),
    obtenerResumenMes: new ObtenerResumenMes(datos),
    limitadorFrecuencia: new LimitadorMemoria(ESCRITURAS_POR_MINUTO, 60_000),
  };
}
