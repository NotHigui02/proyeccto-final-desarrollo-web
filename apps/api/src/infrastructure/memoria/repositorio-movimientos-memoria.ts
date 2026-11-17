import { randomUUID } from 'node:crypto';
import {
  mesDeFecha,
  type FiltrosMovimientos,
  type Movimiento,
  type MovimientoEntrada,
  type Pagina,
  type Paginacion,
} from '@gastos/shared';
import type { RepositorioMovimientos } from '../../application/ports/repositorio-movimientos.js';
import { ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import { MOVIMIENTOS_SEMILLA, UID_DEMO } from './semilla.js';

function compararDesc(a: Movimiento, b: Movimiento): number {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
  if (a.id !== b.id) return a.id < b.id ? 1 : -1;
  return 0;
}

function vaDespuesDelCursor(movimiento: Movimiento, cursor: Movimiento): boolean {
  return compararDesc(movimiento, cursor) > 0;
}

export class RepositorioMovimientosMemoria implements RepositorioMovimientos {
  private readonly porUsuario = new Map<string, Movimiento[]>();

  constructor(semilla: readonly Movimiento[] = MOVIMIENTOS_SEMILLA, uid = UID_DEMO) {
    this.porUsuario.set(
      uid,
      semilla.map((movimiento) => ({ ...movimiento })),
    );
  }

  listar(
    uid: string,
    filtros: FiltrosMovimientos,
    paginacion: Paginacion,
  ): Promise<Pagina<Movimiento>> {
    let items = [...this.listaDe(uid)];

    if (filtros.mes) {
      items = items.filter((movimiento) => mesDeFecha(movimiento.fecha) === filtros.mes);
    }
    if (filtros.tipo) {
      items = items.filter((movimiento) => movimiento.tipo === filtros.tipo);
    }
    if (filtros.categoriaId) {
      items = items.filter((movimiento) => movimiento.categoriaId === filtros.categoriaId);
    }

    items.sort(compararDesc);

    if (paginacion.cursor) {
      const ancla = items.find((movimiento) => movimiento.id === paginacion.cursor);
      if (ancla) {
        items = items.filter((movimiento) => vaDespuesDelCursor(movimiento, ancla));
      }
    }

    const pagina = items.slice(0, paginacion.limite);
    const hayMas = items.length > paginacion.limite;
    const ultimo = pagina[pagina.length - 1];
    return Promise.resolve({
      items: pagina,
      siguienteCursor: hayMas && ultimo ? ultimo.id : null,
    });
  }

  listarPorRango(uid: string, desde: string, hasta: string): Promise<readonly Movimiento[]> {
    const items = this.listaDe(uid).filter(
      (movimiento) => movimiento.fecha >= desde && movimiento.fecha <= hasta,
    );
    return Promise.resolve(items);
  }

  obtener(uid: string, id: string): Promise<Movimiento | null> {
    return Promise.resolve(this.listaDe(uid).find((movimiento) => movimiento.id === id) ?? null);
  }

  crear(uid: string, entrada: MovimientoEntrada): Promise<Movimiento> {
    const movimiento: Movimiento = { id: randomUUID(), ...entrada };
    this.listaDe(uid).push(movimiento);
    return Promise.resolve(movimiento);
  }

  actualizar(uid: string, id: string, entrada: MovimientoEntrada): Promise<Movimiento> {
    const lista = this.listaDe(uid);
    const indice = lista.findIndex((movimiento) => movimiento.id === id);
    const previo = lista[indice];
    if (indice < 0 || !previo) {
      return Promise.reject(new ErrorNoEncontrado('Movimiento no encontrado'));
    }
    const actualizado: Movimiento = {
      id,
      ...entrada,
      comprobanteUrl: previo.comprobanteUrl,
    };
    lista[indice] = actualizado;
    return Promise.resolve(actualizado);
  }

  guardarComprobanteUrl(uid: string, id: string, url: string | null): Promise<Movimiento> {
    const lista = this.listaDe(uid);
    const indice = lista.findIndex((movimiento) => movimiento.id === id);
    const previo = lista[indice];
    if (indice < 0 || !previo) {
      return Promise.reject(new ErrorNoEncontrado('Movimiento no encontrado'));
    }
    const actualizado: Movimiento = { ...previo, comprobanteUrl: url };
    lista[indice] = actualizado;
    return Promise.resolve(actualizado);
  }

  eliminar(uid: string, id: string): Promise<void> {
    const lista = this.listaDe(uid);
    const indice = lista.findIndex((movimiento) => movimiento.id === id);
    if (indice < 0) {
      return Promise.reject(new ErrorNoEncontrado('Movimiento no encontrado'));
    }
    lista.splice(indice, 1);
    return Promise.resolve();
  }

  contarPorCategoria(uid: string, categoriaId: string): Promise<number> {
    return Promise.resolve(
      this.listaDe(uid).filter((movimiento) => movimiento.categoriaId === categoriaId).length,
    );
  }

  private listaDe(uid: string): Movimiento[] {
    let lista = this.porUsuario.get(uid);
    if (!lista) {
      lista = [];
      this.porUsuario.set(uid, lista);
    }
    return lista;
  }
}
