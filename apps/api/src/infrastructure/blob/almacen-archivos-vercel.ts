import {
  contentTypeDePathname,
  esTipoComprobantePermitido,
  pathnameEsDelUsuario,
  TAMANO_MAX_COMPROBANTE_BYTES,
  TIPOS_COMPROBANTE_PERMITIDOS,
} from '@gastos/shared';
import { del, get, head } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type {
  AlmacenArchivos,
  ArchivoDescarga,
  ArchivoRegistrado,
} from '../../application/ports/almacen-archivos.js';
import {
  ErrorNoEncontrado,
  ErrorProhibido,
  ErrorTipoNoSoportado,
  ErrorValidacion,
} from '../../domain/errors/errores-dominio.js';

async function streamABuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const respuesta = new Response(stream);
  return Buffer.from(await respuesta.arrayBuffer());
}

export class AlmacenArchivosVercel implements AlmacenArchivos {
  constructor(private readonly token: string) {}

  async autorizarSubida(entrada: {
    uid: string;
    body: unknown;
    request: Request;
  }): Promise<unknown> {
    const body = entrada.body as HandleUploadBody;
    try {
      return await handleUpload({
        body,
        request: entrada.request,
        token: this.token,
        onBeforeGenerateToken: (pathname) => {
          if (!pathnameEsDelUsuario(pathname, entrada.uid)) {
            return Promise.reject(
              new ErrorProhibido('El pathname del comprobante no pertenece al usuario'),
            );
          }
          const contentType = contentTypeDePathname(pathname);
          if (!contentType || !esTipoComprobantePermitido(contentType)) {
            return Promise.reject(new ErrorTipoNoSoportado('Tipo de archivo no permitido'));
          }
          return Promise.resolve({
            allowedContentTypes: [...TIPOS_COMPROBANTE_PERMITIDOS],
            maximumSizeInBytes: TAMANO_MAX_COMPROBANTE_BYTES,
            addRandomSuffix: true,
            tokenPayload: JSON.stringify({ uid: entrada.uid }),
          });
        },
        onUploadCompleted: () => Promise.resolve(),
      });
    } catch (error) {
      if (
        error instanceof ErrorProhibido ||
        error instanceof ErrorTipoNoSoportado ||
        error instanceof ErrorValidacion ||
        error instanceof ErrorNoEncontrado
      ) {
        throw error;
      }
      throw new ErrorValidacion(
        error instanceof Error ? error.message : 'No se pudo autorizar la subida',
      );
    }
  }

  async registrar(uid: string, pathname: string): Promise<ArchivoRegistrado> {
    if (!pathnameEsDelUsuario(pathname, uid)) {
      throw new ErrorProhibido('El pathname del comprobante no pertenece al usuario');
    }
    const contentType = contentTypeDePathname(pathname);
    if (!contentType || !esTipoComprobantePermitido(contentType)) {
      throw new ErrorTipoNoSoportado('Tipo de archivo no permitido');
    }

    try {
      const meta = await head(pathname, { token: this.token });
      if (!pathnameEsDelUsuario(meta.pathname, uid)) {
        throw new ErrorProhibido('El pathname del comprobante no pertenece al usuario');
      }
      return { url: meta.url, pathname: meta.pathname };
    } catch (error) {
      if (error instanceof ErrorProhibido || error instanceof ErrorTipoNoSoportado) {
        throw error;
      }
      throw new ErrorNoEncontrado('Comprobante no encontrado en el almacén');
    }
  }

  async obtener(url: string): Promise<ArchivoDescarga | null> {
    const resultado = await get(url, { access: 'private', token: this.token });
    if (!resultado?.stream) return null;
    const cuerpo = await streamABuffer(resultado.stream);
    const nombre = resultado.blob.pathname.split('/').pop() ?? 'comprobante';
    return {
      cuerpo,
      contentType: resultado.blob.contentType,
      contentDisposition: `inline; filename="${nombre}"`,
    };
  }

  async eliminar(url: string): Promise<void> {
    await del(url, { token: this.token });
  }
}
