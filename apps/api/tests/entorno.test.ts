import { describe, expect, it } from 'vitest';
import { clavePrivadaFirebase, cargarEntorno } from '../src/infrastructure/config/entorno.js';

describe('cargarEntorno', () => {
  it('no exige Firebase en test', () => {
    const entorno = cargarEntorno({ NODE_ENV: 'test' });
    expect(entorno.NODE_ENV).toBe('test');
    expect(entorno.FIREBASE_PROJECT_ID).toBeUndefined();
  });

  it('exige Firebase fuera de test', () => {
    expect(() => cargarEntorno({ NODE_ENV: 'development' })).toThrow(/FIREBASE/);
  });

  it('acepta credenciales completas en development', () => {
    const entorno = cargarEntorno({
      NODE_ENV: 'development',
      FIREBASE_PROJECT_ID: 'demo',
      FIREBASE_CLIENT_EMAIL: 'demo@demo.iam.gserviceaccount.com',
      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n',
    });
    expect(entorno.FIREBASE_PROJECT_ID).toBe('demo');
    expect(clavePrivadaFirebase(entorno.FIREBASE_PRIVATE_KEY ?? '')).toContain('\nABC\n');
  });
});
