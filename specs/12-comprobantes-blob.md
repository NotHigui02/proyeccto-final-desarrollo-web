# 12 · Comprobantes con Vercel Blob

**Estado:** Hecho · **Hito:** 4 · **Enunciado:** §9.5, §9.6

## Objetivo

Adjuntar un comprobante (imagen o PDF) a un movimiento, guardado en un store **privado** y entregado solo a
su dueño a través de la API.

## Diseño

- Puerto `AlmacenArchivos` (`autorizarSubida`, `registrar`, `obtener`, `eliminar`) con adaptador Vercel Blob.
- `POST /api/comprobantes/upload` con `handleUpload`: en `onBeforeGenerateToken` (1) verificar sesión,
  (2) `pathname` debe empezar por `usuarios/<uid>/`, (3) `allowedContentTypes` (jpeg, png, webp, pdf) y
  tamaño máximo, (4) `addRandomSuffix` y `tokenPayload` con el `uid`.
- `POST /api/movimientos/:id/comprobante`: el cliente notifica al terminar; la API verifica el `pathname`
  y guarda `comprobanteUrl`.
- `GET /api/movimientos/:id/comprobante`: entrega el archivo comprobando el dueño.
- `DELETE` del comprobante solo por la API con `del(url)`.
- Web: imágenes reducidas con `<canvas>` antes de subir; subida directa con `upload()` de
  `@vercel/blob/client`.

## Tareas

- [x] Puerto, adaptador y rutas + pruebas (401, pathname ajeno → 403, tipo no permitido → 415).
- [x] Componente de subida con progreso accesible.
- [x] Revisión de cuotas del plan Hobby y limpieza de archivos de prueba.

## Dependencias por aprobar

`@vercel/blob` (api y web).
