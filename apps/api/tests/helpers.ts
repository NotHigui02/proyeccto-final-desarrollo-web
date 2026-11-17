import type { UsuarioSesion } from '@gastos/shared';
import { construirApp, type Dependencias } from '../src/app.js';
import type { LimitadorFrecuencia } from '../src/application/ports/limitador-frecuencia.js';
import type { Reloj } from '../src/application/ports/reloj.js';
import type { RequerirUsuario } from '../src/application/ports/requerir-usuario.js';
import type { VerificadorSesion } from '../src/application/ports/verificador-sesion.js';
import { ActualizarCategoria } from '../src/application/use-cases/actualizar-categoria.js';
import { ActualizarMovimiento } from '../src/application/use-cases/actualizar-movimiento.js';
import { CerrarSesion } from '../src/application/use-cases/cerrar-sesion.js';
import { CrearCategoria } from '../src/application/use-cases/crear-categoria.js';
import { CrearMovimiento } from '../src/application/use-cases/crear-movimiento.js';
import { CrearSesion } from '../src/application/use-cases/crear-sesion.js';
import { EliminarCategoria } from '../src/application/use-cases/eliminar-categoria.js';
import { EliminarMovimiento } from '../src/application/use-cases/eliminar-movimiento.js';
import { ExportarMovimientosMes } from '../src/application/use-cases/exportar-movimientos-mes.js';
import { GuardarPresupuesto } from '../src/application/use-cases/guardar-presupuesto.js';
import { ListarCategorias } from '../src/application/use-cases/listar-categorias.js';
import { ListarMovimientos } from '../src/application/use-cases/listar-movimientos.js';
import { ObtenerEstadoSalud } from '../src/application/use-cases/obtener-estado-salud.js';
import { ObtenerMovimiento } from '../src/application/use-cases/obtener-movimiento.js';
import { ObtenerPresupuesto } from '../src/application/use-cases/obtener-presupuesto.js';
import { ObtenerResumenMes } from '../src/application/use-cases/obtener-resumen-mes.js';
import { ObtenerUsuarioActual } from '../src/application/use-cases/obtener-usuario-actual.js';
import { RequerirUsuario as CasoRequerirUsuario } from '../src/application/use-cases/requerir-usuario.js';
import { VerificadorSesionMemoria } from '../src/infrastructure/auth/verificador-sesion-memoria.js';
import { cargarEntorno } from '../src/infrastructure/config/entorno.js';
import { RepositorioCategoriasMemoria } from '../src/infrastructure/memoria/repositorio-categorias-memoria.js';
import { LimitadorMemoria } from '../src/infrastructure/memoria/limitador-memoria.js';
import { RepositorioMovimientosMemoria } from '../src/infrastructure/memoria/repositorio-movimientos-memoria.js';
import { RepositorioPresupuestosMemoria } from '../src/infrastructure/memoria/repositorio-presupuestos-memoria.js';
import { UID_DEMO } from '../src/infrastructure/memoria/semilla.js';

export const WEB_ORIGIN = 'http://localhost:5173';
export const relojFijo: Reloj = { ahora: () => new Date('2026-11-17T15:00:00.000Z') };

export const USUARIO_DEMO: UsuarioSesion = {
  uid: UID_DEMO,
  correo: 'demo@example.com',
  rol: 'usuario',
};

export function crearDependenciasPrueba(
  limitador?: LimitadorFrecuencia,
  opciones?: {
    categorias?: RepositorioCategoriasMemoria;
    movimientos?: RepositorioMovimientosMemoria;
    presupuestos?: RepositorioPresupuestosMemoria;
    requerirUsuario?: RequerirUsuario;
    verificador?: VerificadorSesion;
    reloj?: Reloj;
  },
): Dependencias {
  const categorias = opciones?.categorias ?? new RepositorioCategoriasMemoria();
  const movimientos = opciones?.movimientos ?? new RepositorioMovimientosMemoria();
  const presupuestos = opciones?.presupuestos ?? new RepositorioPresupuestosMemoria();
  const reloj = opciones?.reloj ?? relojFijo;
  const verificador = opciones?.verificador ?? new VerificadorSesionMemoria();
  if (verificador instanceof VerificadorSesionMemoria) {
    verificador.registrarIdToken('token-demo', USUARIO_DEMO);
  }
  const requerirUsuario =
    opciones?.requerirUsuario ??
    ({
      ejecutar: () => Promise.resolve(USUARIO_DEMO),
    } satisfies RequerirUsuario);

  return {
    cookieSecure: false,
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
    eliminarMovimiento: new EliminarMovimiento(movimientos),
    exportarMovimientosMes: new ExportarMovimientosMes(categorias, movimientos),
    obtenerPresupuesto: new ObtenerPresupuesto(presupuestos),
    guardarPresupuesto: new GuardarPresupuesto(presupuestos),
    limitadorFrecuencia: limitador ?? new LimitadorMemoria(1000, 60_000),
  };
}

export function crearAppPrueba(
  limitador?: LimitadorFrecuencia,
  opciones?: Parameters<typeof crearDependenciasPrueba>[1],
) {
  return construirApp(
    cargarEntorno({ NODE_ENV: 'test', WEB_ORIGIN }),
    crearDependenciasPrueba(limitador, opciones),
  );
}

/** App de prueba con verificación real de cookie/Bearer vía memoria. */
export function crearAppPruebaConAuth(verificador = new VerificadorSesionMemoria()) {
  verificador.registrarIdToken('token-demo', USUARIO_DEMO);
  return crearAppPrueba(undefined, {
    verificador,
    requerirUsuario: new CasoRequerirUsuario(verificador),
  });
}
