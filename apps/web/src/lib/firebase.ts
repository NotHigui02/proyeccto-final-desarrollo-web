import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

function leerEnv(nombre: keyof ImportMetaEnv): string {
  const crudo: unknown = import.meta.env[nombre];
  if (typeof crudo !== 'string' || crudo.trim() === '') {
    throw new Error(`Falta la variable ${nombre} en el entorno web`);
  }
  return crudo;
}

function configPublica() {
  return {
    apiKey: leerEnv('VITE_FIREBASE_API_KEY'),
    authDomain: leerEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: leerEnv('VITE_FIREBASE_PROJECT_ID'),
    appId: leerEnv('VITE_FIREBASE_APP_ID'),
  };
}

/** Carga diferida del Auth SDK (solo cuando se inicia sesión). */
export function obtenerAuth(): Auth {
  if (!app) {
    app = initializeApp(configPublica());
  }
  auth ??= getAuth(app);
  return auth;
}
