import type { Dependencias } from './app.js';
import { ActualizarCategoria } from './application/use-cases/actualizar-categoria.js';
import { ActualizarMovimiento } from './application/use-cases/actualizar-movimiento.js';
import { CrearCategoria } from './application/use-cases/crear-categoria.js';
import { CrearMovimiento } from './application/use-cases/crear-movimiento.js';
import { EliminarCategoria } from './application/use-cases/eliminar-categoria.js';
import { EliminarMovimiento } from './application/use-cases/eliminar-movimiento.js';
import { ListarCategorias } from './application/use-cases/listar-categorias.js';
import { ListarMovimientos } from './application/use-cases/listar-movimientos.js';
import { ObtenerEstadoSalud } from './application/use-cases/obtener-estado-salud.js';
import { ObtenerMovimiento } from './application/use-cases/obtener-movimiento.js';
import { ObtenerResumenMes } from './application/use-cases/obtener-resumen-mes.js';
import { RequerirUsuarioDemo } from './infrastructure/auth/requerir-usuario-demo.js';
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
    requerirUsuario: new RequerirUsuarioDemo(),
    obtenerEstadoSalud: new ObtenerEstadoSalud(reloj),
    obtenerResumenMes: new ObtenerResumenMes(datos),
    listarCategorias: new ListarCategorias(categorias),
    crearCategoria: new CrearCategoria(categorias),
    actualizarCategoria: new ActualizarCategoria(categorias),
    eliminarCategoria: new EliminarCategoria(categorias, movimientos),
    listarMovimientos: new ListarMovimientos(movimientos),
    obtenerMovimiento: new ObtenerMovimiento(movimientos),
    crearMovimiento: new CrearMovimiento(movimientos, categorias, reloj),
    actualizarMovimiento: new ActualizarMovimiento(movimientos, categorias, reloj),
    eliminarMovimiento: new EliminarMovimiento(movimientos),
    limitadorFrecuencia: new LimitadorMemoria(ESCRITURAS_POR_MINUTO, 60_000),
  };
}
