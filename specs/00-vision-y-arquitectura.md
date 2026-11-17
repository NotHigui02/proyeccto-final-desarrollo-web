# 00 · Visión y arquitectura

**Estado:** Hecho

## Objetivo

Registrar las decisiones de arquitectura y cómo se adapta el enunciado (pensado para Next.js) a la pila
elegida: **API Fastify con arquitectura limpia/hexagonal** y **frontend React + Vite por componentes**.

## Problema y usuario

Estudiante que quiere ver en qué se le va el dinero: registra ingresos y gastos, los clasifica por categoría
y ve totales, gráficos por categoría y evolución mensual, con presupuesto y alerta al 80 %.

## Arquitectura

```text
[ Navegador ]  React 19 · Vite · React Router · TypeScript
   │  Firebase Auth (SDK web) → POST /api/auth/sesion → cookie HttpOnly
   │  fetch a /api (mismo origen: proxy de Vite en local, rewrites de Vercel en producción)
   ▼
[ API REST ]  Fastify (Node 22) desplegado como función en Vercel
   │  ruta (HTTP + Zod) → caso de uso (reglas) → puerto ← adaptador (Firestore/Auth/Blob)
   ├──────▶ [ Firebase ]  Authentication + Firestore (solo Admin SDK)
   └──────▶ [ Vercel Blob ]  comprobantes (store privado)
```

## Adaptaciones al enunciado

| Enunciado (Next.js)                             | Este proyecto                                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| Route Handlers `app/api/**/route.ts`            | Rutas Fastify como plugins en `apps/api/src/infrastructure/http`                       |
| `manejar(handler)` envoltorio de errores        | `setErrorHandler` de Fastify + errores de dominio                                      |
| rutas → servicios → repositorios                | rutas → casos de uso → puertos/adaptadores (hexagonal)                                 |
| App Router (`app/…/page.tsx`)                   | React Router (`apps/web/src/app/rutas.tsx`, `pages/`)                                  |
| `proxy.ts` redirige a `/login`                  | Guardia de ruta en React que redirige si `GET /api/auth/yo` da 401                     |
| `NEXT_PUBLIC_FIREBASE_*`                        | `VITE_FIREBASE_*` (igual de públicas)                                                  |
| Cabeceras en `next.config`                      | Cabeceras en Fastify (API) y en `vercel.json` (estáticos)                              |
| Server Components por defecto                   | SPA; se cuida el rendimiento con división de código (`React.lazy`)                     |
| Pruebas API con `new Request()` al handler      | `app.inject()` de Fastify con dependencias falsas inyectadas                           |
| `next/image`, `next/font`, `useReportWebVitals` | `<img>` con `width/height`, fuentes del sistema, librería `web-vitals` (si se aprueba) |

## Principios

- **SOLID** y **inversión de dependencias**: los casos de uso dependen de interfaces; los adaptadores se
  conectan solo en `container.ts`. ESLint impide imports que rompan las capas.
- **Una sola fuente de validación**: esquemas Zod en `packages/shared`, usados por formularios y API; el
  servidor decide.
- **Dinero en centavos** (enteros) en todo el sistema; formato COP solo al mostrar.
- **Seguridad por defecto**: `uid` desde la sesión, Zod estricto, `no-store` en rutas privadas, errores sin
  detalles internos.

## Riesgos

- Despliegue de Fastify y SPA en un mismo proyecto Vercel (mismo origen) → validar temprano en spec 14.
- Presupuesto de JS ≤ 200 kB con React + Firebase Auth → importar Firebase Auth de forma modular y diferida.
