# 06 · Movimientos

**Estado:** Pendiente · **Hito:** 2–3 · **Enunciado:** RF-01, §8, §9.2, §9.4, §11

## Objetivo

CRUD de ingresos y gastos con lista filtrable y paginada por cursor.

## API

| Método y ruta                 | Detalle                                                                     |
| ----------------------------- | --------------------------------------------------------------------------- |
| `GET /api/movimientos`        | `?mes=&tipo=&categoriaId=&limite=20&cursor=` → `{ items, siguienteCursor }` |
| `GET /api/movimientos/:id`    | `200` · `404` (también si es de otro usuario)                               |
| `POST /api/movimientos`       | `201` · `400` (monto ≤ 0, fecha futura, categoría inexistente)              |
| `PUT /api/movimientos/:id`    | `200` · `400` · `404`                                                       |
| `DELETE /api/movimientos/:id` | `204` · `404`                                                               |

## Diseño

- Puerto `RepositorioMovimientos` (`listar(filtros, paginacion)`, `obtener`, `crear`, `actualizar`,
  `eliminar`, `contarPorCategoria`, `listarPorRango`).
- Casos de uso validan que la categoría exista y pertenezca al usuario; la fecha no futura usa el puerto
  `Reloj`.
- Orden: fecha descendente y luego id (cursor estable).

## Web

- `/movimientos`: filtros (mes, tipo, categoría) con `useDebounce` donde aplique, tabla/lista accesible,
  «Cargar más» con cursor, estados de interfaz, borrar con confirmación.
- `/movimientos/nuevo` (y edición): formulario controlado con `<fieldset>`/`<legend>` para el tipo, monto
  en pesos convertido a centavos, errores por campo con `aria-describedby`.

## Tareas

- [ ] Casos de uso + pruebas (monto 0/negativo, fecha futura, categoría ajena → 404).
- [ ] Rutas + pruebas (`400` monto 0 — §11, `401`, `404`).
- [ ] Prueba de integración ruta → caso de uso → repositorio simulado (§11).
- [ ] Páginas, formulario y lista + pruebas RTL.

## Definición de terminado

CRUD completo, filtros y paginación funcionando; reglas §8 probadas.
