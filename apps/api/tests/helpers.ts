import { construirApp, type Dependencias } from '../src/app.js';
import type { LimitadorFrecuencia } from '../src/application/ports/limitador-frecuencia.js';
import type { Reloj } from '../src/application/ports/reloj.js';
import { ActualizarCategoria } from '../src/application/use-cases/actualizar-categoria.js';
import { CrearCategoria } from '../src/application/use-cases/crear-categoria.js';
import { EliminarCategoria } from '../src/application/use-cases/eliminar-categoria.js';
import { ListarCategorias } from '../src/application/use-cases/listar-categorias.js';
import { ObtenerEstadoSalud } from '../src/application/use-cases/obtener-estado-salud.js';
import { ObtenerResumenMes } from '../src/application/use-cases/obtener-resumen-mes.js';
import { cargarEntorno } from '../src/infrastructure/config/entorno.js';
import { RepositorioCategoriasMemoria } from '../src/infrastructure/memoria/repositorio-categorias-memoria.js';
import { RepositorioDatosEjemplo } from '../src/infrastructure/memoria/datos-ejemplo.js';
import { RepositorioMovimientosMemoria } from '../src/infrastructure/memoria/repositorio-movimientos-memoria.js';
import { LimitadorMemoria } from '../src/infrastructure/memoria/limitador-memoria.js';
import { UID_DEMO } from '../src/infrastructure/memoria/semilla.js';

export const WEB_ORIGIN = 'http://localhost:5173';
export const relojFijo: Reloj = { ahora: () => new Date('2026-11-17T15:00:00.000Z') };

export function crearDependenciasPrueba(
  limitador?: LimitadorFrecuencia,
  opciones?: {
    categorias?: RepositorioCategoriasMemoria;
    movimientos?: RepositorioMovimientosMemoria;
  },
): Dependencias {
  const categorias = opciones?.categorias ?? new RepositorioCategoriasMemoria();
  const movimientos = opciones?.movimientos ?? new RepositorioMovimientosMemoria();
  return {
    uid: UID_DEMO,
    obtenerEstadoSalud: new ObtenerEstadoSalud(relojFijo),
    obtenerResumenMes: new ObtenerResumenMes(new RepositorioDatosEjemplo(categorias, movimientos)),
    listarCategorias: new ListarCategorias(categorias),
    crearCategoria: new CrearCategoria(categorias),
    actualizarCategoria: new ActualizarCategoria(categorias),
    eliminarCategoria: new EliminarCategoria(categorias, movimientos),
    limitadorFrecuencia: limitador ?? new LimitadorMemoria(1000, 60_000),
  };
}

export function crearAppPrueba(limitador?: LimitadorFrecuencia) {
  return construirApp(
    cargarEntorno({ NODE_ENV: 'test', WEB_ORIGIN }),
    crearDependenciasPrueba(limitador),
  );
}
