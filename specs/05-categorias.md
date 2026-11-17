# 05 · Categorías

**Estado:** Hecho · **Hito:** 2–3 · **Enunciado:** RF-01, §8, §9.4

## Objetivo

CRUD de categorías por usuario, con nombre único y color, y la regla «no se borra una categoría con
movimientos».

## API

| Método y ruta                | Cuerpo              | Respuesta                                        |
| ---------------------------- | ------------------- | ------------------------------------------------ |
| `GET /api/categorias`        | —                   | `200 { items: Categoria[] }`                     |
| `POST /api/categorias`       | `{ nombre, color }` | `201 Categoria` · `400` · `409` nombre duplicado |
| `PUT /api/categorias/:id`    | `{ nombre, color }` | `200 Categoria` · `400` · `404` · `409`          |
| `DELETE /api/categorias/:id` | —                   | `204` · `404` · `409` tiene movimientos          |

## Diseño (hexagonal)

- Puerto `RepositorioCategorias` (`listar`, `obtener`, `crear`, `actualizar`, `eliminar`, `existeNombre`)
  y consulta `RepositorioMovimientos.contarPorCategoria`.
- Casos de uso: `ListarCategorias`, `CrearCategoria`, `ActualizarCategoria`, `EliminarCategoria`.
- Adaptador en memoria (pruebas y desarrollo) y luego Firestore (spec 10).
- Unicidad de nombre sin distinguir mayúsculas (nombre normalizado).

## Web

- `/categorias`: lista accesible, formulario controlado validado con el esquema compartido, edición en
  `<dialog>` con foco gestionado, confirmación de borrado, mensajes con `aria-live`, estados de interfaz.

## Tareas

- [x] Casos de uso + pruebas con repositorios en memoria (incluida la regla de borrado).
- [x] Rutas + pruebas `app.inject` (201, 400, 404, 409).
- [x] Página y componentes + pruebas RTL (al menos formulario y error de validación).

## Definición de terminado

CRUD funcional contra el adaptador en memoria; reglas §8 probadas en servidor y cliente.
