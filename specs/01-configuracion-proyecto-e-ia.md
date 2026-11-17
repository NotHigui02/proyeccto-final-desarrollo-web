# 01 · Configuración del proyecto e IA

**Estado:** Hecho · **Hito:** 1 · **Enunciado:** §13, §15, §16 (configuración de IA en el primer commit)

## Objetivo

Dejar el monorepo listo para desarrollar con calidad automática y una configuración de IA propia, segura y
comprobable, versionada en el primer commit.

## Diseño

- npm workspaces: `packages/shared`, `apps/api`, `apps/web`. TypeScript estricto (`tsconfig.base.json`).
- Calidad automática: ESLint (strict type-checked, jsx-a11y strict, react-hooks, reglas de capas
  hexagonales, prohibición de Firestore en el navegador), Prettier, Husky + lint-staged en `pre-commit`,
  CI en GitHub Actions (`npm run check` + `npm audit`).
- IA:
  - Reglas: `AGENTS.md` + `.cursor/rules/*.mdc` (generales, seguridad, API, web, specs).
  - Restricciones aplicadas con hooks (`.cursor/hooks.json`):
    - `beforeReadFile` y `preToolUse` → `proteger-archivos.mjs`: niega secretos y rutas fuera del proyecto.
    - `beforeShellExecution` → `proteger-shell.mjs`: niega secretos/rutas externas/`printenv`/`sudo`; pide
      permiso para push, dependencias, `npx`, red, `vercel`, `firebase`, borrados recursivos.
    - `postToolUse` → `calidad-post-edicion.mjs`: Prettier + ESLint sobre lo que edita la IA y le devuelve
      los errores.
  - Segunda capa: `.cursorignore` y permisos de `.cursor/cli.json`.
  - Evidencia: `ia/pruebas/*.test.mjs` (`npm run test:ia`) y `ia/bitacora.md`.

## Tareas

- [x] Monorepo con workspaces y scripts raíz (`dev`, `check`, `lint`, `typecheck`, `test`, `test:ia`).
- [x] `packages/shared` con primer esquema (`mesSchema`) y prueba.
- [x] API Fastify hexagonal mínima: `GET /api/salud`, manejo de errores común, entorno validado con Zod,
      logs con id de petición y datos sensibles ocultos.
- [x] Web React + Vite: layout accesible (landmarks, saltar al contenido, navegación), rutas de §3 y 404.
- [x] ESLint, Prettier, EditorConfig, Husky, lint-staged, CI.
- [x] Configuración de IA: reglas, hooks, permisos, pruebas y bitácora.
- [ ] El usuario copia `ia/plantillas/cursorignore` a `.cursorignore` (Cursor no deja que el agente lo cree).
- [ ] Demostración en vivo de los hooks (ver `ia/README.md`).

## Pruebas

- `npm run test:ia`: política (unitarias) + hooks reales con JSON de Cursor (punta a punta).
- `npm test`: esquema de mes, `GET /api/salud`, formato de errores 400/404/409/500, layout accesible.

## Definición de terminado

`npm run check` en verde y primer commit con toda la configuración.
