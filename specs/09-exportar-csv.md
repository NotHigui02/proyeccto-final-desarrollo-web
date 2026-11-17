# 09 · Exportar el mes a CSV

**Estado:** Pendiente · **Hito:** 3 · **Enunciado:** RF-06, §9.4

## Objetivo

Descargar los movimientos del mes como CSV.

## Diseño

- `GET /api/movimientos/exportar?mes=` → `200 text/csv; charset=utf-8` con
  `Content-Disposition: attachment; filename="movimientos-2026-11.csv"`.
- Función pura `generarCSV(movimientos, categorias)`: BOM UTF-8 para Excel, separador `;` o `,` (decidir),
  escape de comillas, saltos de línea y **prevención de inyección de fórmulas** (`=`, `+`, `-`, `@` al inicio).
- Montos en pesos con dos columnas: `montoCentavos` y `montoCOP` legible.
- Web: botón «Exportar CSV» (enlace con `download`) en `/movimientos` y en `/`.

## Tareas

- [ ] `generarCSV` + pruebas (escapes, fórmulas, mes vacío).
- [ ] Ruta + pruebas (`200` con cabeceras, `400` mes inválido, `401`).
- [ ] Botón accesible en la web.
