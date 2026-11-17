# 08 · Presupuesto mensual

**Estado:** Pendiente · **Hito:** 2–3 · **Enunciado:** RF-04, CA-4

## Objetivo

Permitir definir un presupuesto de gasto por mes y alertar al llegar al 80 %.

## Diseño

- Datos (no definidos en el enunciado, propuesta): `usuarios/{uid}/presupuestos/{AAAA-MM}` con
  `montoCentavos` (entero > 0). El id del documento es el mes (un presupuesto por mes).
- API: `GET /api/presupuestos/:mes` (`200` · `404`), `PUT /api/presupuestos/:mes` (crea o reemplaza).
- Regla pura `estadoPresupuesto(gastado, presupuesto)` → `{ porcentaje, nivel: 'normal'|'alerta'|'excedido' }`
  con `alerta` desde 80 % (aritmética entera).
- Web: formulario en `/` o `/categorias`; alerta visible con texto e icono (no solo color), anunciada con
  `role="status"`/`aria-live`; barra de progreso accesible (`<progress>` o `role="progressbar"`).

## Tareas

- [ ] Regla pura + pruebas (79 %, 80 %, 100 %, > 100 %).
- [ ] Casos de uso, puerto, rutas + pruebas.
- [ ] Componente de presupuesto + prueba RTL de la alerta (CA-4).

## Preguntas abiertas

- ¿Presupuesto total del mes o por categoría? Por defecto: total del mes (lo que pide RF-04).
