import type { Dependencias } from './app.js';
import { ActualizarCategoria } from './application/use-cases/actualizar-categoria.js';
import { CrearCategoria } from './application/use-cases/crear-categoria.js';
import { EliminarCategoria } from './application/use-cases/eliminar-categoria.js';
import { ListarCategorias } from './application/use-cases/listar-categorias.js';
import { ObtenerEstadoSalud } from './application/use-cases/obtener-estado-salud.js';
import { ObtenerResumenMes } from './application/use-cases/obtener-resumen-mes.js';
import { RepositorioCategoriasMemoria } from './infrastructure/memoria/repositorio-categorias-memoria.js';
import { RepositorioDatosEjemplo } from './infrastructure/memoria/datos-ejemplo.js';
import { RepositorioMovimientosMemoria } from './infrastructure/memoria/repositorio-movimientos-memoria.js';
import { LimitadorMemoria } from './infrastructure/memoria/limitador-memoria.js';
import { UID_DEMO } from './infrastructure/memoria/semilla.js';
import { RelojSistema } from './infrastructure/reloj/reloj-sistema.js';

/** Hasta 60 escrituras por IP cada minuto (plan Hobby / abuso básico). */
const ESCRITURAS_POR_MINUTO = 60;

export function crearDependencias(): Dependencias {
  const reloj = new RelojSistema();
  const categorias = new RepositorioCategoriasMemoria();
  const movimientos = new RepositorioMovimientosMemoria();
  const datos = new RepositorioDatosEjemplo(categorias, movimientos);

  return {
    uid: UID_DEMO,
    obtenerEstadoSalud: new ObtenerEstadoSalud(reloj),
    obtenerResumenMes: new ObtenerResumenMes(datos),
    listarCategorias: new ListarCategorias(categorias),
    crearCategoria: new CrearCategoria(categorias),
    actualizarCategoria: new ActualizarCategoria(categorias),
    eliminarCategoria: new EliminarCategoria(categorias, movimientos),
    limitadorFrecuencia: new LimitadorMemoria(ESCRITURAS_POR_MINUTO, 60_000),
  };
}
