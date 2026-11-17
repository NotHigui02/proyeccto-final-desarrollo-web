export interface ArchivoDescarga {
  cuerpo: Buffer;
  contentType: string;
  contentDisposition: string;
}

export interface ArchivoRegistrado {
  url: string;
  pathname: string;
}

/**
 * Almacén de comprobantes (Blob privado o memoria en pruebas).
 * El uid de autorización lo aportan los casos de uso / hooks, nunca el cliente.
 */
export interface AlmacenArchivos {
  /** Token de subida cliente (`handleUpload`) o callback de finalización. */
  autorizarSubida(entrada: { uid: string; body: unknown; request: Request }): Promise<unknown>;

  /** Verifica pathname del usuario y devuelve la URL canónica a guardar. */
  registrar(uid: string, pathname: string): Promise<ArchivoRegistrado>;

  obtener(url: string): Promise<ArchivoDescarga | null>;

  eliminar(url: string): Promise<void>;
}
