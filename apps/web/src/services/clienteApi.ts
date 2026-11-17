import {
  categoriaSchema,
  resumenSchema,
  type Categoria,
  type CategoriaEntrada,
  type Resumen,
} from '@gastos/shared';
import { z } from 'zod';

export class ErrorApi extends Error {
  constructor(
    message: string,
    readonly estado: number,
    readonly detalles: { campo: string; mensaje: string }[] = [],
  ) {
    super(message);
    this.name = 'ErrorApi';
  }
}

const listaCategoriasSchema = z.strictObject({
  items: z.array(categoriaSchema),
});

async function leerError(respuesta: Response): Promise<ErrorApi> {
  let mensaje = `Error ${String(respuesta.status)}`;
  let detalles: { campo: string; mensaje: string }[] = [];
  try {
    const cuerpo = (await respuesta.json()) as {
      error?: string;
      detalles?: { campo: string; mensaje: string }[];
    };
    if (typeof cuerpo.error === 'string') mensaje = cuerpo.error;
    if (Array.isArray(cuerpo.detalles)) detalles = cuerpo.detalles;
  } catch {
    // cuerpo no JSON
  }
  return new ErrorApi(mensaje, respuesta.status, detalles);
}

async function pedirJson<T>(
  url: string,
  esquema: z.ZodType<T>,
  init: RequestInit = {},
): Promise<T> {
  const cabeceras = new Headers(init.headers);
  cabeceras.set('Accept', 'application/json');
  if (init.body !== undefined && !cabeceras.has('Content-Type')) {
    cabeceras.set('Content-Type', 'application/json');
  }

  const respuesta = await fetch(url, { ...init, headers: cabeceras });
  if (!respuesta.ok) throw await leerError(respuesta);
  return esquema.parse(await respuesta.json());
}

export function obtenerResumen(mes: string, señal?: AbortSignal): Promise<Resumen> {
  return pedirJson(`/api/resumen?mes=${encodeURIComponent(mes)}`, resumenSchema, { signal: señal });
}

export function listarCategorias(señal?: AbortSignal): Promise<Categoria[]> {
  return pedirJson('/api/categorias', listaCategoriasSchema, { signal: señal }).then(
    (cuerpo) => cuerpo.items,
  );
}

export function crearCategoria(entrada: CategoriaEntrada): Promise<Categoria> {
  return pedirJson('/api/categorias', categoriaSchema, {
    method: 'POST',
    body: JSON.stringify(entrada),
  });
}

export function actualizarCategoria(id: string, entrada: CategoriaEntrada): Promise<Categoria> {
  return pedirJson(`/api/categorias/${encodeURIComponent(id)}`, categoriaSchema, {
    method: 'PUT',
    body: JSON.stringify(entrada),
  });
}

export async function eliminarCategoria(id: string): Promise<void> {
  const respuesta = await fetch(`/api/categorias/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!respuesta.ok) throw await leerError(respuesta);
}
