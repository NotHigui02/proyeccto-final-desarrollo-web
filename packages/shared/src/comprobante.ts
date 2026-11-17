import { z } from 'zod';

export const TIPOS_COMPROBANTE_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

/** 4 MiB: margen bajo el límite de funciones y cuotas Hobby. */
export const TAMANO_MAX_COMPROBANTE_BYTES = 4 * 1024 * 1024;

export const registrarComprobanteSchema = z.strictObject({
  pathname: z
    .string()
    .trim()
    .min(1, 'El pathname es obligatorio')
    .max(512, 'El pathname es demasiado largo'),
});

export type RegistrarComprobante = z.infer<typeof registrarComprobanteSchema>;

export function prefijoComprobantesUsuario(uid: string): string {
  return `usuarios/${uid}/`;
}

export function pathnameEsDelUsuario(pathname: string, uid: string): boolean {
  const prefijo = prefijoComprobantesUsuario(uid);
  return pathname.startsWith(prefijo) && pathname.length > prefijo.length;
}

export function contentTypeDePathname(pathname: string): string | null {
  const lower = pathname.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return null;
}

export function esTipoComprobantePermitido(contentType: string): boolean {
  return (TIPOS_COMPROBANTE_PERMITIDOS as readonly string[]).includes(contentType);
}
