import type { Dependencias } from './app.js';
import type { AlmacenArchivos } from './application/ports/almacen-archivos.js';
import type { RepositorioCategorias } from './application/ports/repositorio-categorias.js';
import type { RepositorioMovimientos } from './application/ports/repositorio-movimientos.js';
import type { RepositorioPresupuestos } from './application/ports/repositorio-presupuestos.js';
import type { VerificadorSesion } from './application/ports/verificador-sesion.js';
import { ActualizarCategoria } from './application/use-cases/actualizar-categoria.js';
import { ActualizarMovimiento } from './application/use-cases/actualizar-movimiento.js';
import { AutorizarSubidaComprobante } from './application/use-cases/autorizar-subida-comprobante.js';
import { CerrarSesion } from './application/use-cases/cerrar-sesion.js';
import { CrearCategoria } from './application/use-cases/crear-categoria.js';
import { CrearMovimiento } from './application/use-cases/crear-movimiento.js';
import { CrearSesion } from './application/use-cases/crear-sesion.js';
import { EliminarCategoria } from './application/use-cases/eliminar-categoria.js';
import { EliminarComprobante } from './application/use-cases/eliminar-comprobante.js';
import { EliminarMovimiento } from './application/use-cases/eliminar-movimiento.js';
import { ExportarMovimientosMes } from './application/use-cases/exportar-movimientos-mes.js';
import { GuardarPresupuesto } from './application/use-cases/guardar-presupuesto.js';
import { ListarCategorias } from './application/use-cases/listar-categorias.js';
import { ListarMovimientos } from './application/use-cases/listar-movimientos.js';
import { ObtenerComprobante } from './application/use-cases/obtener-comprobante.js';
import { ObtenerEstadoSalud } from './application/use-cases/obtener-estado-salud.js';
import { ObtenerMovimiento } from './application/use-cases/obtener-movimiento.js';
import { ObtenerPresupuesto } from './application/use-cases/obtener-presupuesto.js';
import { ObtenerResumenMes } from './application/use-cases/obtener-resumen-mes.js';
import { ObtenerUsuarioActual } from './application/use-cases/obtener-usuario-actual.js';
import { RegistrarComprobante } from './application/use-cases/registrar-comprobante.js';
import { RequerirUsuario } from './application/use-cases/requerir-usuario.js';
import { AlmacenArchivosVercel } from './infrastructure/blob/almacen-archivos-vercel.js';
import type { Entorno } from './infrastructure/config/entorno.js';
import { obtenerAppFirebase, obtenerFirestore } from './infrastructure/firebase/admin.js';
import { RepositorioCategoriasFirestore } from './infrastructure/firebase/repositorio-categorias-firestore.js';
import { RepositorioMovimientosFirestore } from './infrastructure/firebase/repositorio-movimientos-firestore.js';
import { RepositorioPresupuestosFirestore } from './infrastructure/firebase/repositorio-presupuestos-firestore.js';
import { VerificadorSesionFirebase } from './infrastructure/firebase/verificador-sesion-firebase.js';
import { RepositorioCategoriasMemoria } from './infrastructure/memoria/repositorio-categorias-memoria.js';
import { LimitadorMemoria } from './infrastructure/memoria/limitador-memoria.js';
import { RepositorioMovimientosMemoria } from './infrastructure/memoria/repositorio-movimientos-memoria.js';
import { RepositorioPresupuestosMemoria } from './infrastructure/memoria/repositorio-presupuestos-memoria.js';
import { RelojSistema } from './infrastructure/reloj/reloj-sistema.js';

/** Hasta 60 escrituras por IP cada minuto (plan Hobby / abuso básico). */
const ESCRITURAS_POR_MINUTO = 60;

function crearRepositorios(entorno: Entorno): {
  categorias: RepositorioCategorias;
  movimientos: RepositorioMovimientos;
  presupuestos: RepositorioPresupuestos;
  verificador: VerificadorSesion;
  almacen: AlmacenArchivos;
} {
  if (entorno.NODE_ENV === 'test') {
    throw new Error('crearDependencias no se usa en test; use crearDependenciasPrueba');
  }

  const tokenBlob = entorno.BLOB_READ_WRITE_TOKEN;
  if (!tokenBlob) {
    throw new Error('Falta BLOB_READ_WRITE_TOKEN en el entorno');
  }

  const appFirebase = obtenerAppFirebase(entorno);
  const db = obtenerFirestore(entorno);
  return {
    categorias: new RepositorioCategoriasFirestore(db),
    movimientos: new RepositorioMovimientosFirestore(db),
    presupuestos: new RepositorioPresupuestosFirestore(db),
    verificador: new VerificadorSesionFirebase(appFirebase),
    almacen: new AlmacenArchivosVercel(tokenBlob),
  };
}

export function crearDependencias(entorno: Entorno): Dependencias {
  const reloj = new RelojSistema();
  const { categorias, movimientos, presupuestos, verificador, almacen } =
    crearRepositorios(entorno);
  const requerirUsuario = new RequerirUsuario(verificador);
  const cookieSecure = entorno.NODE_ENV === 'production';

  return {
    cookieSecure,
    requerirUsuario,
    crearSesion: new CrearSesion(verificador),
    cerrarSesion: new CerrarSesion(verificador),
    obtenerUsuarioActual: new ObtenerUsuarioActual(),
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
    eliminarMovimiento: new EliminarMovimiento(movimientos, almacen),
    exportarMovimientosMes: new ExportarMovimientosMes(categorias, movimientos),
    obtenerPresupuesto: new ObtenerPresupuesto(presupuestos),
    guardarPresupuesto: new GuardarPresupuesto(presupuestos),
    autorizarSubidaComprobante: new AutorizarSubidaComprobante(almacen),
    registrarComprobante: new RegistrarComprobante(movimientos, almacen),
    obtenerComprobante: new ObtenerComprobante(movimientos, almacen),
    eliminarComprobante: new EliminarComprobante(movimientos, almacen),
    limitadorFrecuencia: new LimitadorMemoria(ESCRITURAS_POR_MINUTO, 60_000),
  };
}

/** Solo para pruebas unitarias que aún necesiten repos en memoria sin auth. */
export function crearRepositoriosMemoria() {
  return {
    categorias: new RepositorioCategoriasMemoria(),
    movimientos: new RepositorioMovimientosMemoria(),
    presupuestos: new RepositorioPresupuestosMemoria(),
  };
}
