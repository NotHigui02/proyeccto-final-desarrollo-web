# Evidencias de calidad · sección 14

Fecha de la pasada: **2026-11-17**.

**URL de producción:** https://proyecto-final-desarrollo-web-three.vercel.app

Verificación API: `GET /api/auth/yo` → **401** sin cookie (esperado). `/login` → **200**. Login con usuario de prueba: OK.

## Retos de excelencia elegidos (≥ 3)

1. **Modo oscuro y alto contraste** — `prefers-color-scheme` y `prefers-contrast` en `apps/web/src/styles/global.css`.
2. **Navegación accesible** — enlace «Saltar al contenido», `AnuncioRuta` (foco + `aria-live` con el título) y títulos por página.
3. **División de código** — `React.lazy` + `Suspense` en `apps/web/src/app/rutas.tsx` (JS transferido en `/login` ≈ 164 KiB ≤ 200 kB).

## Checklist automatizado ya cubierto (§11)

| Criterio                                         | Evidencia                                               |
| ------------------------------------------------ | ------------------------------------------------------- |
| Totales por categoría con 3 movimientos          | `packages/shared/tests/resumen.test.ts`                 |
| Formato COP `1250000` → «$ 12.500»               | `packages/shared/tests` (dinero / CA-1)                 |
| API monto 0 o negativo → 400                     | `apps/api/tests/movimientos.rutas.test.ts`              |
| ≥ 3 pruebas de componentes por rol/etiqueta      | `AppLayout`, `LoginPage`, `Formulario*`, gráficos, etc. |
| ≥ 3 pruebas API 401 / 400 / 403-404              | auth, movimientos, comprobantes, categorías             |
| ≥ 1 integración ruta → caso de uso → repositorio | `movimientos.rutas.test.ts` (crea y obtiene)            |

## Lighthouse (lab · página pública `/login`)

Informes JSON en `calidad/informes/`. Metas: Rendimiento ≥ 90 · Accesibilidad ≥ 95 · Buenas prácticas ≥ 95 · SEO ≥ 95.

| Página   | Dispositivo | Rendimiento | Accesibilidad | Buenas prácticas | SEO | Informe                       |
| -------- | ----------- | ----------- | ------------- | ---------------- | --- | ----------------------------- |
| `/login` | Móvil       | **97**      | **100**       | 93\*             | 91† | `informes/login-mobile.json`  |
| `/login` | Escritorio  | **100**     | **100**       | 93\*             | 91† | `informes/login-desktop.json` |

\* Buenas prácticas 93: Chrome registra el **401 esperado** de `GET /api/auth/yo` al comprobar sesión (comportamiento correcto sin cookie). Source maps de producción omitidos a propósito.

† SEO 91: `robots.txt` tenía `Sitemap` relativo. Ya corregido a URL absoluta (`apps/web/public/robots.txt` + `sitemap.xml`) — **redeploy** y volver a medir (esperado ≥ 95).

Páginas autenticadas (`/`, `/movimientos/nuevo`): Lighthouse sin sesión redirige a `/login`. Medir manualmente con sesión iniciada (DevTools → Lighthouse) y anotar aquí.

## Core Web Vitals (`/login`, lab)

| Métrica | Meta     | Móvil | Escritorio | Notas                               |
| ------- | -------- | ----- | ---------- | ----------------------------------- |
| LCP     | ≤ 2,5 s  | 2,0 s | 0,5 s      | Cumple                              |
| INP     | ≤ 200 ms | —     | —          | Campo; lab no lo reporta            |
| CLS     | ≤ 0,1    | 0     | 0          | Cumple                              |

## Responsive (360 / 768 / 1024) y zoom 200 %

Instrucciones: [`capturas/README.md`](capturas/README.md). Completar con capturas del estudiante:

| Ancho      | Archivo      | Sin scroll horizontal | Notas |
| ---------- | ------------ | --------------------- | ----- |
| 360        | `capturas/…` |                       |       |
| 768        | `capturas/…` |                       |       |
| 1024       | `capturas/…` |                       |       |
| Zoom 200 % | `capturas/…` |                       |       |

## axe / validador HTML / teclado / lector

| Prueba                    | Fecha | Resultado | Evidencia |
| ------------------------- | ----- | --------- | --------- |
| axe DevTools (3 páginas)  |       |           |           |
| Validador HTML W3C        |       |           |           |
| Solo teclado              |       |           |           |
| Lector (VoiceOver / NVDA) |       |           |           |

### Guía rápida (manual)

1. **axe:** extensión axe DevTools → Scan en `/login`, inicio (con sesión) y formulario nuevo movimiento.
2. **HTML:** https://validator.w3.org/nu/ → “Validate by URI” con la URL de producción `/login`.
3. **Teclado:** Tab por login y nav; Enter envía; foco visible; enlace «Saltar al contenido».
4. **Lector:** VoiceOver (Cmd+F5); comprobar anuncio de título al cambiar de ruta.
