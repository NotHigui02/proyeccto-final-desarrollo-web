import type { Dependencias } from './app.js';
import { ActualizarCategoria } from './application/use-cases/actualizar-categoria.js';
import { ActualizarMovimiento } from './application/use-cases/actualizar-movimiento.js';
import { CrearCategoria } from './application/use-cases/crear-categoria.js';
import { CrearMovimiento } from './application/use-cases/crear-movimiento.js';
import { EliminarCategoria } from './application/use-cases/eliminar-categoria.js';
import { EliminarMovimiento } from './application/use-cases/eliminar-movimiento.js';
import { ExportarMovimientosMes } from './application/use-cases/exportar-movimientos-mes.js';
import { GuardarPresupuesto } from './application/use-cases/guardar-presupuesto.js';
import { ListarCategorias } from './application/use-cases/listar-categorias.js';
import { ListarMovimientos } from './application/use-cases/listar-movimientos.js';
import { ObtenerEstadoSalud } from './application/use-cases/obtener-estado-salud.js';
import { ObtenerMovimiento } from './application/use-cases/obtener-movimiento.js';
import { ObtenerPresupuesto } from './application/use-cases/obtener-presupuesto.js';
import { ObtenerResumenMes } from './application/use-cases/obtener-resumen-mes.js';
import type { RepositorioCategorias } from './application/ports/repositorio-categorias.js';
import type { RepositorioMovimientos } from './application/ports/repositorio-movimientos.js';
import type { RepositorioPresupuestos } from './application/ports/repositorio-presupuestos.js';
import { RequerirUsuarioDemo } from './infrastructure/auth/requerir-usuario-demo.js';
import type { Entorno } from './infrastructure/config/entorno.js';
import { obtenerFirestore } from './infrastructure/firebase/admin.js';
import { RepositorioCategoriasFirestore } from './infrastructure/firebase/repositorio-categorias-firestore.js';
import { RepositorioMovimientosFirestore } from './infrastructure/firebase/repositorio-movimientos-firestore.js';
import { RepositorioPresupuestosFirestore } from './infrastructure/firebase/repositorio-presupuestos-firestore.js';
import { RepositorioCategoriasMemoria } from './infrastructure/memoria/repositorio-categorias-memoria.js';
import { RepositorioMovimientosMemoria } from './infrastructure/memoria/repositorio-movimientos-memoria.js';
import { RepositorioPresupuestosMemoria } from './infrastructure/memoria/repositorio-presupuestos-memoria.js';
import { LimitadorMemoria } from './infrastructure/memoria/limitador-memoria.js';
import { UID_DEMO } from './infrastructure/memoria/semilla.js';
import { RelojSistema } from './infrastructure/reloj/reloj-sistema.js';

/** Hasta 60 escrituras por IP cada minuto (plan Hobby / abuso básico). */
const ESCRITURAS_POR_MINUTO = 60;

function crearRepositorios(entorno: Entorno): {
  categorias: RepositorioCategorias;
  movimientos: RepositorioMovimientos;
  presupuestos: RepositorioPresupuestos;
} {
  if (entorno.NODE_ENV === 'test') {
    return {
      categorias: new RepositorioCategoriasMemoria(),
      movimientos: new RepositorioMovimientosMemoria(),
      presupuestos: new RepositorioPresupuestosMemoria(),
    };
  }

  const db = obtenerFirestore(entorno);
  return {
    categorias: new RepositorioCategoriasFirestore(db),
    movimientos: new RepositorioMovimientosFirestore(db),
    presupuestos: new RepositorioPresupuestosFirestore(db),
  };
}

export function crearDependencias(entorno: Entorno): Dependencias {
  const reloj = new RelojSistema();
  const { categorias, movimientos, presupuestos } = crearRepositorios(entorno);

  return {
    uid: UID_DEMO,
    requerirUsuario: new RequerirUsuarioDemo(),
    obtenerEstadoSalud: new ObtenerEstadoSalud(reloj),
    obtenerResumenMes: new ObtenerResumenMes(categorias, movimientos, presupuestos),
    listarCategorias: new ListarCategorias(categorias),
    crearCategoria: new CrearCategoria(categorias),
    actualizarCategoria: new ActualizarCategoria(categorias),
    eliminarCategoria: new EliminarCategoria(categorias, movimientos),
    listarMovimientos: new ListarMovimientos(movimientos),
    obtenerMovimiento: new ObtenerMovimiento(movimientos),
    crearMovimiento: new CrearMovimiento(movimientos, categorias, reloj),
    actualizarMovimiento: new ActualizarMovimiento(movimientos, categorias, reloj),
    eliminarMovimiento: new EliminarMovimiento(movimientos),
    exportarMovimientosMes: new ExportarMovimientosMes(categorias, movimientos),
    obtenerPresupuesto: new ObtenerPresupuesto(presupuestos),
    guardarPresupuesto: new GuardarPresupuesto(presupuestos),
    limitadorFrecuencia: new LimitadorMemoria(ESCRITURAS_POR_MINUTO, 60_000),
  };
}
