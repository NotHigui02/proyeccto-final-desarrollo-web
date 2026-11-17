# 14 · Calidad, accesibilidad y despliegue

**Estado:** Pendiente · **Hito:** 4 · **Enunciado:** §4, §11, §14, §16

## Objetivo

Desplegar en Vercel con mismo origen para web y API, y demostrar las metas de calidad con evidencias.

## Despliegue

- Un proyecto Vercel: SPA estática (`apps/web/dist`) + Fastify como función bajo `/api/*` (rewrites en
  `vercel.json`). Variables de entorno configuradas en Vercel (no en Git).
- Cabeceras de seguridad para estáticos en `vercel.json` (CSP, `X-Content-Type-Options`, `Referrer-Policy`).
- `robots.txt`, `sitemap.xml`, Open Graph, favicon, 404 propia.
- Verificación en producción: `GET /api/auth/yo` y flujo de inicio de sesión.

## Calidad (metas §14)

- Lighthouse móvil: Rendimiento ≥ 90, Accesibilidad ≥ 95, Buenas prácticas ≥ 95, SEO ≥ 95.
- LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1; JS transferido ≤ 200 kB (división de código con `React.lazy`).
- Responsive 360/768/1024 y zoom 200 % sin scroll horizontal.
- Retos de excelencia (elegir ≥ 3): pruebas axe en Vitest, Playwright en 3 anchos con axe, modo oscuro y
  alto contraste, navegación accesible con foco y título anunciados.

## Pruebas mínimas pendientes de verificar (§11)

- [ ] Lógica pura: totales por categoría con 3 movimientos (spec 02).
- [ ] Formato COP `1250000` → «$ 12.500» (spec 02).
- [ ] API: monto 0 o negativo → 400 (spec 06).
- [ ] ≥ 3 pruebas de componentes por rol/etiqueta.
- [ ] ≥ 3 pruebas de API: 401, 400, 403/404.
- [ ] ≥ 1 prueba de integración ruta → caso de uso → repositorio simulado.

## Evidencias

- [ ] Carpeta `calidad/` + `CALIDAD.md`: Lighthouse (3 páginas, móvil y escritorio), capturas en 3 anchos,
      axe, validador HTML, lista manual (teclado, zoom, lector de pantalla) con fecha, tabla LCP/INP/CLS.
- [ ] `README` con instrucciones, URL desplegada y lista de verificación de seguridad (§16) marcada.
- [ ] Auditoría de la bitácora de IA y demostración en vivo de la configuración de IA.
