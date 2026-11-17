import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { clavePrivadaFirebase, type Entorno } from '../config/entorno.js';

let app: App | undefined;

/** Inicializa el Admin SDK una sola vez por proceso. */
export function obtenerAppFirebase(entorno: Entorno): App {
  if (
    !entorno.FIREBASE_PROJECT_ID ||
    !entorno.FIREBASE_CLIENT_EMAIL ||
    !entorno.FIREBASE_PRIVATE_KEY
  ) {
    throw new Error('Faltan credenciales de Firebase Admin en el entorno');
  }

  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: entorno.FIREBASE_PROJECT_ID,
          clientEmail: entorno.FIREBASE_CLIENT_EMAIL,
          privateKey: clavePrivadaFirebase(entorno.FIREBASE_PRIVATE_KEY),
        }),
      });
  }

  return app;
}

export function obtenerFirestore(entorno: Entorno): Firestore {
  return getFirestore(obtenerAppFirebase(entorno));
}
