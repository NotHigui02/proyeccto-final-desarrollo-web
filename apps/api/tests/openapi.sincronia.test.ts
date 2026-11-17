import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance, HTTPMethods } from 'fastify';
import { crearAppPrueba } from './helpers.js';

const raizRepo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/** Rutas HTTP de la API (sin HEAD implícitos). */
const RUTAS_API: ReadonlyArray<{ method: HTTPMethods; url: string }> = [
  { method: 'GET', url: '/api/salud' },
  { method: 'POST', url: '/api/auth/sesion' },
  { method: 'DELETE', url: '/api/auth/sesion' },
  { method: 'GET', url: '/api/auth/yo' },
  { method: 'GET', url: '/api/resumen' },
  { method: 'GET', url: '/api/categorias' },
  { method: 'POST', url: '/api/categorias' },
  { method: 'PUT', url: '/api/categorias/:id' },
  { method: 'DELETE', url: '/api/categorias/:id' },
  { method: 'GET', url: '/api/movimientos' },
  { method: 'POST', url: '/api/movimientos' },
  { method: 'GET', url: '/api/movimientos/exportar' },
  { method: 'GET', url: '/api/movimientos/:id' },
  { method: 'PUT', url: '/api/movimientos/:id' },
  { method: 'DELETE', url: '/api/movimientos/:id' },
  { method: 'GET', url: '/api/movimientos/:id/comprobante' },
  { method: 'POST', url: '/api/movimientos/:id/comprobante' },
  { method: 'DELETE', url: '/api/movimientos/:id/comprobante' },
  { method: 'POST', url: '/api/comprobantes/upload' },
  { method: 'GET', url: '/api/presupuestos/:mes' },
  { method: 'PUT', url: '/api/presupuestos/:mes' },
];

function extraerOperacionesOpenApi(yaml: string): Set<string> {
  const operaciones = new Set<string>();
  let enPaths = false;
  let rutaActual: string | null = null;

  for (const linea of yaml.split('\n')) {
    if (linea.startsWith('paths:')) {
      enPaths = true;
      continue;
    }
    if (enPaths && /^[A-Za-z]/.test(linea)) {
      break;
    }
    if (!enPaths) continue;

    const matchRuta = /^ {2}(\/[^:]+):/.exec(linea);
    if (matchRuta?.[1]) {
      // OpenAPI `{id}` → estilo Fastify `:id`
      rutaActual = matchRuta[1].replaceAll(/\{([A-Za-z0-9_]+)\}/g, ':$1');
      continue;
    }

    const matchMetodo = /^ {4}(get|post|put|delete|patch):/.exec(linea);
    if (matchMetodo?.[1] && rutaActual) {
      operaciones.add(`${matchMetodo[1].toUpperCase()} ${rutaActual}`);
    }
  }

  return operaciones;
}

describe('sincronía OpenAPI ↔ Fastify', () => {
  let app: FastifyInstance;
  let openapi: Set<string>;

  beforeAll(async () => {
    app = crearAppPrueba();
    await app.ready();
    const yaml = readFileSync(resolve(raizRepo, 'openapi.yaml'), 'utf8');
    openapi = extraerOperacionesOpenApi(yaml);
  });

  afterAll(async () => {
    await app.close();
  });

  it('cada ruta de la lista canónica está registrada en Fastify', () => {
    for (const ruta of RUTAS_API) {
      expect(
        app.hasRoute({ method: ruta.method, url: ruta.url }),
        `${ruta.method} ${ruta.url}`,
      ).toBe(true);
    }
  });

  it('cada ruta de Fastify documentada aparece en openapi.yaml', () => {
    for (const ruta of RUTAS_API) {
      const clave = `${ruta.method} ${ruta.url}`;
      expect(openapi.has(clave), `falta en openapi: ${clave}`).toBe(true);
    }
  });

  it('openapi no declara operaciones de /api fuera de la lista canónica', () => {
    const canonicos = new Set(RUTAS_API.map((ruta) => `${ruta.method} ${ruta.url}`));
    for (const operacion of openapi) {
      if (!operacion.includes('/api')) continue;
      expect(canonicos.has(operacion), `sobra en openapi: ${operacion}`).toBe(true);
    }
  });
});
