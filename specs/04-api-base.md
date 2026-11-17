# 04 · Base de la API REST

**Estado:** Pendiente · **Hito:** 3 · **Enunciado:** §9.2, §9.6

## Objetivo

Completar la infraestructura HTTP común antes de los recursos: validación, seguridad y convenciones.

## Diseño

- Ayudante de validación: `validar(esquema, datos)` que lanza `ZodError` → 400 con `detalles` por campo.
- Solo `application/json` en escrituras (→ `415`), `bodyLimit` (→ `413`).
- Cabeceras de seguridad propias (`X-Content-Type-Options: nosniff`, `Referrer-Policy`,
  `Content-Security-Policy` básica para JSON) sin dependencias si es posible.
- CORS: solo mismo origen; sin `Access-Control-Allow-Origin: *`.
- Comprobación de `Origin` en métodos que modifican (CSRF) contra `WEB_ORIGIN`.
- Límite de frecuencia en escrituras (puerto `LimitadorFrecuencia` + adaptador en memoria; `429`).
- Logs con id de petición, sin cuerpos ni cabeceras sensibles (ya configurado `redact`).

## Tareas

- [ ] `validar()` y tipado de `request.body/query` desde esquemas de `@gastos/shared`.
- [ ] Hook de tipo de contenido (415) y prueba de 413.
- [ ] Cabeceras de seguridad + prueba.
- [ ] Comprobación de `Origin` (403) + prueba.
- [ ] Limitador de frecuencia (429) + prueba.

## Pruebas

`app.inject` para 400, 403 (Origin), 413, 415 y 429 con formato `{ error, detalles? }`.

## Preguntas abiertas

- ¿Se acepta `@fastify/rate-limit`/`@fastify/helmet` o se implementa a mano? Por defecto: a mano y simple.
