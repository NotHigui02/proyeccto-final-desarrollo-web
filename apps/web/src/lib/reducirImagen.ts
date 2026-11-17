const MAX_LADO = 1600;
const CALIDAD_JPEG = 0.82;

/** Reduce imágenes grandes con canvas antes de subirlas; PDF y otros tipos pasan igual. */
export async function reducirArchivoSiEsImagen(archivo: File): Promise<Blob> {
  if (!archivo.type.startsWith('image/') || archivo.type === 'image/svg+xml') {
    return archivo;
  }

  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, MAX_LADO / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.max(1, Math.round(bitmap.width * escala));
  const alto = Math.max(1, Math.round(bitmap.height * escala));

  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const contexto = canvas.getContext('2d');
  if (!contexto) {
    bitmap.close();
    return archivo;
  }
  contexto.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const tipoSalida = archivo.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise<Blob | null>((resolver) => {
    canvas.toBlob(
      (resultado) => {
        resolver(resultado);
      },
      tipoSalida,
      tipoSalida === 'image/jpeg' ? CALIDAD_JPEG : undefined,
    );
  });

  return blob ?? archivo;
}

export function extensionDeArchivo(archivo: File): string {
  if (archivo.type === 'application/pdf') return 'pdf';
  if (archivo.type === 'image/png') return 'png';
  if (archivo.type === 'image/webp') return 'webp';
  if (archivo.type === 'image/jpeg' || archivo.type === 'image/jpg') return 'jpg';
  const desdeNombre = archivo.name.split('.').pop()?.toLowerCase();
  if (desdeNombre && ['pdf', 'png', 'webp', 'jpg', 'jpeg'].includes(desdeNombre)) {
    return desdeNombre === 'jpeg' ? 'jpg' : desdeNombre;
  }
  return 'bin';
}
