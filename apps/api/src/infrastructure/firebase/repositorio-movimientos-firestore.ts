import { randomUUID } from 'node:crypto';
import {
  rangoDelMes,
  type FiltrosMovimientos,
  type Movimiento,
  type MovimientoEntrada,
  type Pagina,
  type Paginacion,
} from '@gastos/shared';
import { FieldPath, type DocumentData, type Firestore, type Query } from 'firebase-admin/firestore';
import type { RepositorioMovimientos } from '../../application/ports/repositorio-movimientos.js';
import { ErrorNoEncontrado } from '../../domain/errors/errores-dominio.js';
import { coleccionMovimientos } from './rutas-usuario.js';

function mapearMovimiento(id: string, datos: DocumentData): Movimiento {
  return {
    id,
    tipo: datos.tipo as Movimiento['tipo'],
    montoCentavos: Number(datos.montoCentavos),
    categoriaId: String(datos.categoriaId),
    nota: datos.nota === null || datos.nota === undefined ? null : String(datos.nota),
    fecha: String(datos.fecha),
    comprobanteUrl:
      typeof datos.comprobanteUrl === 'string' && datos.comprobanteUrl.length > 0
        ? datos.comprobanteUrl
        : null,
  };
}

function datosEntrada(entrada: MovimientoEntrada): DocumentData {
  return {
    tipo: entrada.tipo,
    montoCentavos: entrada.montoCentavos,
    categoriaId: entrada.categoriaId,
    nota: entrada.nota,
    fecha: entrada.fecha,
    comprobanteUrl: entrada.comprobanteUrl,
  };
}

export class RepositorioMovimientosFirestore implements RepositorioMovimientos {
  constructor(private readonly db: Firestore) {}

  async listar(
    uid: string,
    filtros: FiltrosMovimientos,
    paginacion: Paginacion,
  ): Promise<Pagina<Movimiento>> {
    let consulta: Query = coleccionMovimientos(this.db, uid);

    if (filtros.tipo) {
      consulta = consulta.where('tipo', '==', filtros.tipo);
    }
    if (filtros.categoriaId) {
      consulta = consulta.where('categoriaId', '==', filtros.categoriaId);
    }
    if (filtros.mes) {
      const { desde, hasta } = rangoDelMes(filtros.mes);
      consulta = consulta.where('fecha', '>=', desde).where('fecha', '<=', hasta);
    }

    consulta = consulta.orderBy('fecha', 'desc').orderBy(FieldPath.documentId(), 'desc');

    if (paginacion.cursor) {
      const ancla = await coleccionMovimientos(this.db, uid).doc(paginacion.cursor).get();
      if (ancla.exists) {
        consulta = consulta.startAfter(ancla);
      }
    }

    const snap = await consulta.limit(paginacion.limite + 1).get();
    const hayMas = snap.docs.length > paginacion.limite;
    const pagina = snap.docs.slice(0, paginacion.limite);
    const ultimo = pagina[pagina.length - 1];

    return {
      items: pagina.map((doc) => mapearMovimiento(doc.id, doc.data())),
      siguienteCursor: hayMas && ultimo ? ultimo.id : null,
    };
  }

  async listarPorRango(uid: string, desde: string, hasta: string): Promise<readonly Movimiento[]> {
    const snap = await coleccionMovimientos(this.db, uid)
      .where('fecha', '>=', desde)
      .where('fecha', '<=', hasta)
      .orderBy('fecha', 'asc')
      .get();
    return snap.docs.map((doc) => mapearMovimiento(doc.id, doc.data()));
  }

  async obtener(uid: string, id: string): Promise<Movimiento | null> {
    const doc = await coleccionMovimientos(this.db, uid).doc(id).get();
    if (!doc.exists) return null;
    return mapearMovimiento(doc.id, doc.data() ?? {});
  }

  async crear(uid: string, entrada: MovimientoEntrada): Promise<Movimiento> {
    const id = randomUUID();
    await coleccionMovimientos(this.db, uid).doc(id).create(datosEntrada(entrada));
    return { id, ...entrada };
  }

  async actualizar(uid: string, id: string, entrada: MovimientoEntrada): Promise<Movimiento> {
    const ref = coleccionMovimientos(this.db, uid).doc(id);
    const actual = await ref.get();
    if (!actual.exists) {
      throw new ErrorNoEncontrado('Movimiento no encontrado');
    }
    const previo = mapearMovimiento(id, actual.data() ?? {});
    const datos = {
      ...datosEntrada(entrada),
      comprobanteUrl: previo.comprobanteUrl,
    };
    await ref.set(datos);
    return { id, ...entrada, comprobanteUrl: previo.comprobanteUrl };
  }

  async guardarComprobanteUrl(uid: string, id: string, url: string | null): Promise<Movimiento> {
    const ref = coleccionMovimientos(this.db, uid).doc(id);
    const actual = await ref.get();
    if (!actual.exists) {
      throw new ErrorNoEncontrado('Movimiento no encontrado');
    }
    await ref.update({ comprobanteUrl: url });
    return { ...mapearMovimiento(id, actual.data() ?? {}), comprobanteUrl: url };
  }

  async eliminar(uid: string, id: string): Promise<void> {
    const ref = coleccionMovimientos(this.db, uid).doc(id);
    const actual = await ref.get();
    if (!actual.exists) {
      throw new ErrorNoEncontrado('Movimiento no encontrado');
    }
    await ref.delete();
  }

  async contarPorCategoria(uid: string, categoriaId: string): Promise<number> {
    const snap = await coleccionMovimientos(this.db, uid)
      .where('categoriaId', '==', categoriaId)
      .count()
      .get();
    return snap.data().count;
  }
}
