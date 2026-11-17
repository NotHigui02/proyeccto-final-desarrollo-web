# 10 · Persistencia en Firestore

**Estado:** Pendiente · **Hito:** 3 · **Enunciado:** §9.3, §9.4, §9.6

## Objetivo

Implementar los adaptadores Firestore de los puertos de repositorio sin tocar casos de uso ni rutas.

## Diseño

- `infrastructure/firebase/admin.ts`: inicializa el Admin SDK con `FIREBASE_PROJECT_ID`,
  `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (convertir `\n` literales). Variables validadas con Zod en
  `entorno.ts`.
- Adaptadores: `RepositorioCategoriasFirestore`, `RepositorioMovimientosFirestore`,
  `RepositorioPresupuestosFirestore` bajo `usuarios/{uid}/…`.
- Unicidad del nombre de categoría con documento índice + transacción (`409`).
- Paginación con `startAfter` sobre (`fecha` desc, id).
- `firestore.rules` con `allow read, write: if false;` y `firestore.indexes.json` con los índices compuestos.
- `container.ts` elige adaptador por entorno (memoria en `test`, Firestore en el resto).

## Tareas

- [ ] Configuración del Admin SDK (requiere que el usuario cree el proyecto Firebase y su `.env`).
- [ ] Adaptadores + pruebas de contrato compartidas con el adaptador en memoria.
- [ ] Reglas e índices versionados.

## Dependencias por aprobar

`firebase-admin` (en `apps/api`).
