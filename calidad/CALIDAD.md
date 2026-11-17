# Evidencias de calidad · sección 14

Fecha de la pasada: _pendiente (tras despliegue en producción)_.

## Retos de excelencia elegidos (≥ 3)

1. **Modo oscuro y alto contraste** — `prefers-color-scheme` y `prefers-contrast` en `apps/web/src/styles/global.css`.
2. **Navegación accesible** — enlace «Saltar al contenido», `AnuncioRuta` (foco + `aria-live` con el título) y títulos por página.
3. **División de código** — `React.lazy` + `Suspense` en `apps/web/src/app/rutas.tsx` (meta JS transferido ≤ 200 kB).

Pendiente opcional tras instalar dependencia: pruebas axe en Vitest (`vitest-axe`).

## Checklist automatizado ya cubierto (§11)

| Criterio                                              | Evidencia                                              |
| ----------------------------------------------------- | ------------------------------------------------------ |
| Totales por categoría con 3 movimientos               | `packages/shared/tests/resumen.test.ts`                |
| Formato COP `1250000` → «$ 12.500»                    | `packages/shared/tests` (dinero / CA-1)                 |
| API monto 0 o negativo → 400                          | `apps/api/tests/movimientos.rutas.test.ts`             |
| ≥ 3 pruebas de componentes por rol/etiqueta           | `AppLayout`, `LoginPage`, `Formulario*`, gráficos, etc. |
| ≥ 3 pruebas API 401 / 400 / 403-404                   | auth, movimientos, comprobantes, categorías            |
| ≥ 1 integración ruta → caso de uso → repositorio      | `movimientos.rutas.test.ts` (crea y obtiene)           |

## Lighthouse (móvil y escritorio · 3 páginas)

Completar tras tener la URL de producción. Páginas sugeridas: `/login` (pública), `/movimientos/nuevo` (formulario), `/` (con sesión).

| Página | Dispositivo | Rendimiento | Accesibilidad | Buenas prácticas | SEO | Informe |
| ------ | ----------- | ----------- | ------------- | ---------------- | --- | ------- |
|        | Móvil       |             |               |                  |     |         |
|        | Escritorio  |             |               |                  |     |         |

Metas: Rendimiento ≥ 90 · Accesibilidad ≥ 95 · Buenas prácticas ≥ 95 · SEO ≥ 95.

## Core Web Vitals

| Métrica | Meta     | Medido | Notas |
| ------- | -------- | ------ | ----- |
| LCP     | ≤ 2,5 s  |        |       |
| INP     | ≤ 200 ms |        | Campo (Lighthouse no lo da en lab) |
| CLS     | ≤ 0,1    |        |       |

## Responsive (360 / 768 / 1024) y zoom 200 %

Guardar capturas en `calidad/capturas/` y listarlas aquí.

| Ancho | Archivo | Sin scroll horizontal | Notas |
| ----- | ------- | --------------------- | ----- |
| 360   |         |                       |       |
| 768   |         |                       |       |
| 1024  |         |                       |       |
| Zoom 200 % |     |                       |       |

## axe / validador HTML / teclado / lector

| Prueba                         | Fecha | Resultado | Evidencia        |
| ------------------------------ | ----- | --------- | ---------------- |
| axe DevTools (3 páginas)       |       |           |                  |
| Validador HTML W3C             |       |           |                  |
| Solo teclado                   |       |           |                  |
| Lector (VoiceOver / NVDA)      |       |           |                  |
