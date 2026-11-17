import {
  contentTypeDePathname,
  esTipoComprobantePermitido,
  pathnameEsDelUsuario,
  TAMANO_MAX_COMPROBANTE_BYTES,
  TIPOS_COMPROBANTE_PERMITIDOS,
} from '@gastos/shared';
import { z } from 'zod';
import type {
  AlmacenArchivos,
  ArchivoDescarga,
  ArchivoRegistrado,
} from '../../application/ports/almacen-archivos.js';
import {
  ErrorProhibido,
  ErrorTipoNoSoportado,
  ErrorValidacion,
} from '../../domain/errors/errores-dominio.js';

const cuerpoTokenSchema = z.strictObject({
  type: z.literal('blob.generate-client-token'),
  payload: z.strictObject({
    pathname: z.string().min(1),
    multipart: z.boolean().optional(),
    clientPayload: z.string().nullable().optional(),
  }),
});

const cuerpoCompletadoSchema = z.strictObject({
  type: z.literal('blob.upload-completed'),
  payload: z.record(z.string(), z.unknown()).optional(),
});

interface ArchivoMemoria {
  pathname: string;
  contentType: string;
  cuerpo: Buffer;
}

/** Almacén en memoria para pruebas: simula handleUpload sin llamar a Vercel. */
export class AlmacenArchivosMemoria implements AlmacenArchivos {
  private readonly archivos = new Map<string, ArchivoMemoria>();

  autorizarSubida(entrada: { uid: string; body: unknown; request: Request }): Promise<unknown> {
    const token = cuerpoTokenSchema.safeParse(entrada.body);
    if (token.success) {
      const { pathname } = token.data.payload;
      this.assertPathnameYTipo(entrada.uid, pathname);
      return Promise.resolve({
        type: 'blob.generate-client-token',
        clientToken: `memoria-token:${entrada.uid}:${pathname}`,
        allowedContentTypes: [...TIPOS_COMPROBANTE_PERMITIDOS],
        maximumSizeInBytes: TAMANO_MAX_COMPROBANTE_BYTES,
      });
    }

    const completado = cuerpoCompletadoSchema.safeParse(entrada.body);
    if (completado.success) {
      return Promise.resolve({ type: 'blob.upload-completed', response: 'ok' });
    }

    return Promise.reject(new ErrorValidacion('Cuerpo de subida no reconocido'));
  }

  registrar(uid: string, pathname: string): Promise<ArchivoRegistrado> {
    this.assertPathnameYTipo(uid, pathname);
    const contentType = contentTypeDePathname(pathname);
    if (!contentType || !esTipoComprobantePermitido(contentType)) {
      return Promise.reject(new ErrorTipoNoSoportado('Tipo de archivo no permitido'));
    }

    const url = `https://blob.memoria.local/${pathname}`;
    if (!this.archivos.has(url)) {
      this.archivos.set(url, {
        pathname,
        contentType,
        cuerpo: Buffer.from(`comprobante-prueba:${pathname}`),
      });
    }
    return Promise.resolve({ url, pathname });
  }

  /** Inserta un archivo ya "subido" (para pruebas de GET/DELETE). */
  guardarParaPrueba(uid: string, pathname: string, cuerpo: Buffer, contentType: string): string {
    this.assertPathnameYTipo(uid, pathname);
    const url = `https://blob.memoria.local/${pathname}`;
    this.archivos.set(url, { pathname, contentType, cuerpo });
    return url;
  }

  obtener(url: string): Promise<ArchivoDescarga | null> {
    const archivo = this.archivos.get(url);
    if (!archivo) return Promise.resolve(null);
    const nombre = archivo.pathname.split('/').pop() ?? 'comprobante';
    return Promise.resolve({
      cuerpo: archivo.cuerpo,
      contentType: archivo.contentType,
      contentDisposition: `inline; filename="${nombre}"`,
    });
  }

  eliminar(url: string): Promise<void> {
    this.archivos.delete(url);
    return Promise.resolve();
  }

  private assertPathnameYTipo(uid: string, pathname: string): void {
    if (!pathnameEsDelUsuario(pathname, uid)) {
      throw new ErrorProhibido('El pathname del comprobante no pertenece al usuario');
    }
    const contentType = contentTypeDePathname(pathname);
    if (!contentType || !esTipoComprobantePermitido(contentType)) {
      throw new ErrorTipoNoSoportado('Tipo de archivo no permitido');
    }
  }
}
