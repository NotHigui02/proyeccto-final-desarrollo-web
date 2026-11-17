import type { Firestore } from 'firebase-admin/firestore';

export function coleccionCategorias(db: Firestore, uid: string) {
  return db.collection('usuarios').doc(uid).collection('categorias');
}

export function coleccionNombresCategoria(db: Firestore, uid: string) {
  return db.collection('usuarios').doc(uid).collection('categoriasNombre');
}

export function coleccionMovimientos(db: Firestore, uid: string) {
  return db.collection('usuarios').doc(uid).collection('movimientos');
}

export function coleccionPresupuestos(db: Firestore, uid: string) {
  return db.collection('usuarios').doc(uid).collection('presupuestos');
}
