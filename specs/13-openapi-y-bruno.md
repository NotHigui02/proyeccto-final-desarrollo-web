# 13 · OpenAPI y colección Bruno

**Estado:** Pendiente · **Hito:** 3 · **Enunciado:** §9.7

## Objetivo

Documentar todas las rutas y entregar una colección de solicitudes para probarlas.

## Diseño

- `openapi.yaml` (OpenAPI 3.1) en la raíz: rutas, parámetros, cuerpos, respuestas (incluidos errores) y
  esquemas (`Error`, `Categoria`, `Movimiento`, `Resumen`, `Pagina`). Seguridad: `cookieAuth` y `bearerAuth`.
- `bruno/`: colección con entorno local y producción; por ruta principal: caso exitoso, `400`, `401` y
  `403`/`404`, más el registro de sesión.
- Prueba automática que verifica que cada ruta registrada en Fastify aparece en `openapi.yaml`.

## Tareas

- [ ] `openapi.yaml` completo.
- [ ] Colección Bruno.
- [ ] Prueba de sincronía rutas ↔ OpenAPI.
