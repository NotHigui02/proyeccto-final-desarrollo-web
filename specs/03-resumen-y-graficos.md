# 03 · Resumen y gráficos con datos de ejemplo

**Estado:** Hecho · **Hito:** 1 · **Enunciado:** RF-02, RF-03, RF-05, §4, §5, §6, CA-2, CA-3

## Objetivo

Página `/` con el resumen del mes (ingresos, gastos, saldo), gráfico de torta de gasto por categoría y
gráfico de barras de evolución mensual, dibujados a mano en SVG, accesibles y responsivos. En este spec los
datos vienen de un endpoint de ejemplo (`GET /api/resumen` con datos en memoria) consumido con `fetch`.

## Diseño

- `context/MesContext.tsx`: proveedor del mes seleccionado sincronizado con `?mes=AAAA-MM`
  (`useSearchParams`); cambiar de mes no recarga la página y la URL es compartible (CA-3, RF-05).
- `components/ui/SelectorMes.tsx`: botones «mes anterior/siguiente» + `<input type="month">`, anuncia el
  cambio con `aria-live`.
- `components/charts/GraficoTorta.tsx` y `GraficoBarras.tsx`: SVG con `viewBox`, `role="img"`,
  `aria-label` descriptivo, patrones/etiquetas además del color, y `TablaDatosGrafico` asociada (CA-2).
  Si SVG no está disponible, solo se muestra la tabla.
- `hooks/useTamanoContenedor.ts`: `ResizeObserver` con detección de soporte; sin soporte, tamaño fijo.
- `useMemo` para totales por categoría (§6).
- `components/ui/EstadoCarga|EstadoVacio|EstadoError` con reintento; esqueletos sin CLS.
- `services/clienteApi.ts`: `fetch` tipado que valida la respuesta con Zod y traduce errores.
- Formato COP y fechas con `formatearCOP`/`formatearFecha` de `@gastos/shared`.

## Tareas

- [x] Endpoint de ejemplo `GET /api/resumen?mes=` (caso de uso + repositorio en memoria con datos semilla).
- [x] `clienteApi` + `useResumenMes(mes)` con estados carga/vacío/error/reintento.
- [x] `MesContext` + `SelectorMes` sincronizados con la URL.
- [x] `GraficoTorta`, `GraficoBarras`, `TablaDatosGrafico`, `useTamanoContenedor`.
- [x] Tarjetas de totales (ingresos, gastos, saldo) sin depender solo del color.
- [x] Página `/` responsiva en 360/768/1024 px.

## Pruebas

- Componentes (RTL): el gráfico expone `role="img"` con nombre y la tabla alternativa contiene los valores;
  el selector cambia la URL a `?mes=`; estado de error muestra botón «Reintentar».
- Hook de tamaño con `ResizeObserver` simulado y sin soporte.

## Definición de terminado

Cumple CA-2 y CA-3; hito 1 demostrable con datos de ejemplo; `npm run check` en verde.
