# 07 · Resumen desde la API

**Estado:** Hecho · **Hito:** 3 · **Enunciado:** RF-02, RF-03, §9.4

## Objetivo

Reemplazar los datos de ejemplo del spec 03 por el cálculo real en el servidor.

## API

- `GET /api/resumen?mes=2026-11` → `{ mes, ingresosCentavos, gastosCentavos, saldoCentavos,
porCategoria: [{ categoriaId, nombre, color, gastoCentavos }], evolucion: [{ mes, ingresosCentavos,
gastosCentavos }] (últimos 6 meses), presupuesto? }`.
- Consulta por rango de `fecha` del mes; cálculo con `calcularResumen` de `@gastos/shared`.

## Tareas

- [x] Caso de uso `ObtenerResumenMes` + pruebas con repositorio en memoria.
- [x] Ruta + pruebas (`400` mes inválido, `401`).
- [x] La web consume el endpoint real sin cambiar los componentes de gráfico.
- [ ] Reto opcional (§12): comparar dos meses en el mismo gráfico de barras.

## Definición de terminado

El resumen y los gráficos reflejan los movimientos reales del usuario.
