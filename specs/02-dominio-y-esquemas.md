# 02 · Dominio y esquemas compartidos

**Estado:** Pendiente · **Hito:** 1 · **Enunciado:** §8, §5 (Intl), §11, CA-1

## Objetivo

Definir una sola vez las reglas de validación y los tipos del negocio, compartidos por la web y la API, y
las utilidades puras de dinero y fechas.

## Diseño

`packages/shared/src/`:

- `dinero.ts`: `montoCentavosSchema` (entero > 0, límite superior razonable), `formatearCOP(centavos)` con
  `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })` y respaldo
  manual si `Intl` no existe; `pesosACentavos(texto)` para el formulario (sin `parseFloat`).
- `fecha.ts`: `fechaMovimientoSchema` (`YYYY-MM-DD`, fecha real, **no futura** respecto a "hoy" inyectable),
  `formatearFecha` con `Intl.DateTimeFormat('es-CO')`, utilidades de mes (`rangoDelMes`, `mesAnterior`,
  `mesSiguiente`, `mesDeFecha`).
- `categoria.ts`: `categoriaEntradaSchema` (`z.strictObject`: `nombre` 1–40 recortado, `color` `#RRGGBB`),
  `Categoria`.
- `movimiento.ts`: `movimientoEntradaSchema` (`tipo: 'ingreso'|'gasto'`, `montoCentavos`, `categoriaId`,
  `nota` ≤ 200 o `null`, `fecha`, `comprobanteUrl` `null`), `Movimiento`, filtros de lista.
- `resumen.ts`: tipos `Resumen` y función pura `calcularResumen(movimientos, categorias)` → totales de
  ingresos, gastos, saldo y gasto por categoría (enteros).
- `paginacion.ts`: `paginacionSchema` (`limite` 1–100, por defecto 20; `cursor` opcional) y `Pagina<T>`.

En la API, `domain/` reutiliza estos tipos y añade las reglas que necesitan datos (p. ej. categoría con
movimientos).

## Tareas

- [ ] `dinero.ts` + pruebas (formato `1250000` → «$ 12.500», ver nota de espacio no separable).
- [ ] `fecha.ts` + pruebas (fecha futura rechazada con reloj fijo, años bisiestos, rango del mes).
- [ ] `categoria.ts`, `movimiento.ts`, `paginacion.ts` + pruebas de esquemas (campos desconocidos
      rechazados, monto 0/negativo/decimal rechazado).
- [ ] `resumen.ts` con `calcularResumen` + prueba con 3 movimientos (§11).
- [ ] CA-1: prueba de que un gasto de 1 250 000 centavos baja el saldo exactamente 1 250 000.

## Pruebas

Vitest en `packages/shared/tests`. Cubren §11 «lógica pura» y «utilidad de formato COP».

## Definición de terminado

Esquemas exportados desde `@gastos/shared`, cobertura de casos límite y `npm run check` en verde.

## Preguntas abiertas

- `Intl` en es-CO usa espacio no separable (`$ 12.500` con U+00A0). Las pruebas deben normalizarlo.
