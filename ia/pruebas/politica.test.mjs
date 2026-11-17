import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  esRutaSensible,
  evaluarComando,
  evaluarPatron,
  evaluarRuta,
} from '../../.cursor/hooks/politica.mjs';

const RAIZ = path.resolve(import.meta.dirname, '..', '..');

describe('archivos sensibles', () => {
  for (const ruta of [
    '.env',
    'apps/api/.env',
    'apps/web/.env.local',
    '.env.production',
    'claves/servidor.pem',
    'privada.key',
    'firebase-adminsdk-abc123.json',
    'mi-service-account.json',
    '/Users/alguien/.ssh/id_rsa',
    '.npmrc',
  ]) {
    it(`detecta ${ruta}`, () => assert.equal(esRutaSensible(ruta), true));
  }

  for (const ruta of [
    'apps/api/.env.example',
    'apps/api/src/app.ts',
    'package.json',
    'specs/README.md',
  ]) {
    it(`no marca ${ruta}`, () => assert.equal(esRutaSensible(ruta), false));
  }
});

describe('evaluarRuta', () => {
  it('permite archivos normales del proyecto', () => {
    assert.equal(evaluarRuta('apps/api/src/app.ts', RAIZ).permiso, 'allow');
    assert.equal(evaluarRuta(path.join(RAIZ, 'README.md'), RAIZ).permiso, 'allow');
  });

  it('niega leer .env dentro del proyecto', () => {
    assert.equal(evaluarRuta('apps/api/.env', RAIZ).permiso, 'deny');
  });

  it('niega salir del proyecto con rutas absolutas, ~ o ..', () => {
    assert.equal(evaluarRuta('/etc/hosts', RAIZ).permiso, 'deny');
    assert.equal(evaluarRuta('~/Documents/otro.txt', RAIZ).permiso, 'deny');
    assert.equal(evaluarRuta('../otro-proyecto/archivo.ts', RAIZ).permiso, 'deny');
    assert.equal(evaluarRuta(path.join(os.homedir(), '.zshrc'), RAIZ).permiso, 'deny');
  });

  it('niega rutas que parecen internas pero escapan', () => {
    assert.equal(evaluarRuta('apps/../../fuera.txt', RAIZ).permiso, 'deny');
  });
});

describe('evaluarPatron (Glob/Grep)', () => {
  it('niega patrones que buscan secretos', () => {
    assert.equal(evaluarPatron('**/.env*').permiso, 'deny');
    assert.equal(evaluarPatron('**/*.pem').permiso, 'deny');
  });

  it('permite patrones normales', () => {
    assert.equal(evaluarPatron('**/*.ts').permiso, 'allow');
    assert.equal(evaluarPatron('**/.env.example').permiso, 'allow');
  });
});

describe('evaluarComando', () => {
  const permitidos = [
    'npm run test',
    'git status',
    'git add -A && git commit -m "feat: algo"',
    'ls apps/api/src',
    'node --test "ia/pruebas/*.test.mjs"',
    'rg "process.env" apps',
  ];
  for (const comando of permitidos) {
    it(`permite: ${comando}`, () => assert.equal(evaluarComando(comando, RAIZ).permiso, 'allow'));
  }

  const denegados = [
    'cat apps/api/.env',
    'grep FIREBASE .env.local',
    'cp .env /tmp/x',
    'printenv',
    'env',
    'sudo rm -rf /',
    'cat ~/.ssh/id_ed25519',
    'ls ../',
    'cat /etc/passwd',
    'cd .. && ls',
    'head -n 5 $HOME/.zshrc',
  ];
  for (const comando of denegados) {
    it(`niega: ${comando}`, () => assert.equal(evaluarComando(comando, RAIZ).permiso, 'deny'));
  }

  const conPermiso = [
    'git push origin dev',
    'npm install zod',
    'npx vercel deploy --prod',
    'curl https://example.com',
    'firebase deploy',
    'rm -rf node_modules',
    'git reset --hard HEAD~1',
  ];
  for (const comando of conPermiso) {
    it(`pide permiso: ${comando}`, () =>
      assert.equal(evaluarComando(comando, RAIZ).permiso, 'ask'));
  }

  it('niega si el directorio de trabajo está fuera del proyecto', () => {
    assert.equal(evaluarComando('ls', RAIZ, os.homedir()).permiso, 'deny');
  });

  it('permite redirigir a /dev/null', () => {
    assert.equal(evaluarComando('npm run lint > /dev/null 2>&1', RAIZ).permiso, 'allow');
  });
});
