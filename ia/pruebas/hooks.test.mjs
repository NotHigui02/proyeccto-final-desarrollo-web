// Ejecuta los hooks reales con el JSON que envía Cursor y verifica su respuesta.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

const RAIZ = path.resolve(import.meta.dirname, '..', '..');
const HOOKS = path.join(RAIZ, '.cursor', 'hooks');

function ejecutarHook(script, entrada) {
  const resultado = spawnSync('node', [path.join(HOOKS, script)], {
    cwd: RAIZ,
    input: JSON.stringify({ workspace_roots: [RAIZ], ...entrada }),
    encoding: 'utf8',
  });
  assert.equal(resultado.status, 0, resultado.stderr);
  return JSON.parse(resultado.stdout);
}

describe('hooks.json', () => {
  const config = JSON.parse(readFileSync(path.join(RAIZ, '.cursor', 'hooks.json'), 'utf8'));

  it('registra los hooks de seguridad con failClosed', () => {
    for (const evento of ['beforeReadFile', 'preToolUse', 'beforeShellExecution']) {
      assert.ok(config.hooks[evento]?.length, `falta el evento ${evento}`);
      assert.equal(config.hooks[evento][0].failClosed, true);
    }
  });

  it('registra el hook de calidad después de editar', () => {
    assert.match(config.hooks.postToolUse[0].command, /calidad-post-edicion/);
  });
});

describe('beforeReadFile', () => {
  it('niega leer apps/api/.env', () => {
    const r = ejecutarHook('proteger-archivos.mjs', {
      file_path: path.join(RAIZ, 'apps/api/.env'),
    });
    assert.equal(r.permission, 'deny');
  });

  it('niega leer fuera del proyecto', () => {
    const r = ejecutarHook('proteger-archivos.mjs', { file_path: '/etc/hosts' });
    assert.equal(r.permission, 'deny');
  });

  it('permite leer código del proyecto', () => {
    const r = ejecutarHook('proteger-archivos.mjs', { file_path: path.join(RAIZ, 'package.json') });
    assert.equal(r.permission, 'allow');
  });
});

describe('preToolUse', () => {
  it('niega la herramienta Read sobre una clave privada', () => {
    const r = ejecutarHook('proteger-archivos.mjs', {
      tool_name: 'Read',
      tool_input: { path: 'firebase-adminsdk-x.json' },
    });
    assert.equal(r.permission, 'deny');
  });

  it('niega Glob buscando archivos .env', () => {
    const r = ejecutarHook('proteger-archivos.mjs', {
      tool_name: 'Glob',
      tool_input: { glob_pattern: '**/.env*' },
    });
    assert.equal(r.permission, 'deny');
  });

  it('niega Grep en una carpeta externa', () => {
    const r = ejecutarHook('proteger-archivos.mjs', {
      tool_name: 'Grep',
      tool_input: { pattern: 'password', path: '/Users' },
    });
    assert.equal(r.permission, 'deny');
  });

  it('niega Write fuera del proyecto', () => {
    const r = ejecutarHook('proteger-archivos.mjs', {
      tool_name: 'Write',
      tool_input: { path: '../fuera.txt', contents: 'x' },
    });
    assert.equal(r.permission, 'deny');
  });

  it('permite editar un archivo del proyecto', () => {
    const r = ejecutarHook('proteger-archivos.mjs', {
      tool_name: 'StrReplace',
      tool_input: { path: path.join(RAIZ, 'apps/api/src/app.ts') },
    });
    assert.equal(r.permission, 'allow');
  });
});

describe('beforeShellExecution', () => {
  it('niega leer secretos por terminal', () => {
    const r = ejecutarHook('proteger-shell.mjs', { command: 'cat apps/api/.env', cwd: RAIZ });
    assert.equal(r.permission, 'deny');
  });

  it('pide permiso para publicar en el remoto', () => {
    const r = ejecutarHook('proteger-shell.mjs', { command: 'git push origin dev', cwd: RAIZ });
    assert.equal(r.permission, 'ask');
  });

  it('permite los scripts del proyecto', () => {
    const r = ejecutarHook('proteger-shell.mjs', { command: 'npm run check', cwd: RAIZ });
    assert.equal(r.permission, 'allow');
  });

  it('falla cerrado ante una entrada inválida', () => {
    const resultado = spawnSync('node', [path.join(HOOKS, 'proteger-shell.mjs')], {
      cwd: RAIZ,
      input: '{esto no es json',
      encoding: 'utf8',
    });
    assert.equal(JSON.parse(resultado.stdout).permission, 'deny');
  });
});

describe('postToolUse (calidad)', () => {
  it('no interviene en herramientas que no editan', () => {
    const r = ejecutarHook('calidad-post-edicion.mjs', {
      tool_name: 'Read',
      tool_input: { path: 'package.json' },
    });
    assert.deepEqual(r, {});
  });
});
