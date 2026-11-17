# 14 · Calidad, accesibilidad y despliegue

**Estado:** En curso · **Hito:** 4 · **Enunciado:** §4, §11, §14, §16

## Objetivo

Desplegar en Vercel con mismo origen para web y API, y demostrar las metas de calidad con evidencias.

## Despliegue

- [x] Un proyecto Vercel: SPA estática (`apps/web/dist`) + Fastify como función bajo `/api/*` (rewrites en
      `vercel.json`). Variables de entorno configuradas en Vercel (no en Git).
- [x] Cabeceras de seguridad para estáticos en `vercel.json` (CSP, `X-Content-Type-Options`, `Referrer-Policy`).
- [x] `robots.txt`, `sitemap.xml`, Open Graph, favicon, 404 propia.
- [x] Verificación en producción: `GET /api/auth/yo` (401) y flujo de inicio de sesión (OK).
- [x] URL: https://proyecto-final-desarrollo-web-three.vercel.app

## Calidad (metas §14)

- [x] Lighthouse en `/login` (móvil/escritorio): rendimiento y accesibilidad cumplen; BP/SEO documentados en
      `calidad/CALIDAD.md` (fix SEO robots pendiente de redeploy).
- [x] LCP/CLS en lab cumplen; JS transferido ≤ 200 kB; retos (≥ 3) implementados en código.
- [ ] Responsive 360/768/1024 y zoom 200 % (capturas del estudiante).
- [ ] axe / validador HTML / teclado / lector (pasada manual).

## Pruebas mínimas (§11)

- [x] Lógica pura: totales por categoría con 3 movimientos (spec 02).
- [x] Formato COP `1250000` → «$ 12.500» (spec 02).
- [x] API: monto 0 o negativo → 400 (spec 06).
- [x] ≥ 3 pruebas de componentes por rol/etiqueta.
- [x] ≥ 3 pruebas de API: 401, 400, 403/404.
- [x] ≥ 1 prueba de integración ruta → caso de uso → repositorio simulado.

## Evidencias

- [x] Carpeta `calidad/` + `CALIDAD.md` con Lighthouse lab `/login` y tablas LCP/CLS.
- [ ] Capturas responsive + checklist axe/HTML/teclado/lector.
- [x] `README` con URL desplegada; §16 audit marcado (evidencias §14 aún abiertas).
- [ ] Demostración en vivo de la configuración de IA (con el docente).
