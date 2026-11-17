# Configuración de IA del proyecto (§15)

Configuración propia para trabajar con asistentes de IA (Cursor) en este repositorio. Tiene tres capas:
**reglas** (lo que la IA debe saber), **restricciones aplicadas** (lo que la IA no puede hacer aunque lo
intente) y **calidad automática** (lo que se comprueba sobre todo código, también el de la IA).

## 1. Reglas del proyecto

| Archivo                             | Contenido                                                     |
| ----------------------------------- | ------------------------------------------------------------- |
| `AGENTS.md`                         | Stack, comandos, estructura, reglas de diseño, lo que sí y no |
| `.cursor/rules/proyecto.mdc`        | Siempre activa: flujo por specs, idioma, verificación         |
| `.cursor/rules/seguridad.mdc`       | Siempre activa: restricciones para la IA y para el código     |
| `.cursor/rules/api-hexagonal.mdc`   | Al tocar `apps/api/**`: capas, puertos, rutas, pruebas        |
| `.cursor/rules/web-componentes.mdc` | Al tocar `apps/web/**`: componentes, accesibilidad, estilos   |
| `.cursor/rules/specs.mdc`           | Al tocar `specs/**`: cómo mantener los specs                  |

## 2. Restricciones de seguridad (aplicadas, no solo pedidas)

Hooks en `.cursor/hooks.json` (scripts Node en `.cursor/hooks/`, lógica en `politica.mjs`):

| Evento de Cursor       | Script                     | Efecto                                                                                                                                                                                                                            |
| ---------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `beforeReadFile`       | `proteger-archivos.mjs`    | Niega leer `.env*` (salvo `.env.example`), claves, cuentas de servicio y archivos fuera del proyecto                                                                                                                              |
| `preToolUse`           | `proteger-archivos.mjs`    | Igual para Read/Write/Grep/Glob/Delete…; niega patrones que buscan secretos                                                                                                                                                       |
| `beforeShellExecution` | `proteger-shell.mjs`       | Niega comandos que mencionan secretos, salen del proyecto (`/…`, `~`, `..`), `printenv`, `sudo`. **Pide permiso** para `git push`, instalar dependencias, `npx`, red (`curl`…), `vercel`, `firebase`, `rm -r`, `git reset --hard` |
| `postToolUse`          | `calidad-post-edicion.mjs` | Prettier + ESLint sobre cada archivo que edita la IA; si hay errores se los devuelve para que los corrija                                                                                                                         |

- Los hooks de seguridad usan `failClosed: true`: si fallan o reciben datos inválidos, **bloquean**.
- Segunda capa: `.cursorignore` (plantilla en `ia/plantillas/cursorignore`) y `.cursor/cli.json`
  (permisos del agente de terminal).
- Limitaciones conocidas: un comando ofuscado a propósito (p. ej. construir el nombre `.env` con variables)
  puede escapar al análisis de texto; por eso existen las capas de `.cursorignore`, `.gitignore` y las
  reglas, y la IA tiene prohibido intentar rodear un bloqueo.

## 3. Calidad automática

- ESLint `strictTypeChecked` + `jsx-a11y` estricto + `react-hooks` + **reglas de capas hexagonales**
  (el dominio no importa infraestructura ni frameworks) + prohibición de `firebase/firestore` en la web.
- Prettier, TypeScript estricto, Vitest.
- `pre-commit` (Husky + lint-staged): lint y formato de lo que se va a commitear + `npm run test:ia`.
- CI (GitHub Actions): `npm run check` y `npm audit` en cada push/PR.

## 4. Evidencia

- `npm run test:ia` ejecuta `ia/pruebas/`:
  - `politica.test.mjs`: casos de la política (rutas sensibles, rutas externas, comandos).
  - `hooks.test.mjs`: ejecuta los hooks reales con el JSON que envía Cursor y valida la respuesta, que el
    `hooks.json` registre los eventos con `failClosed` y que fallen cerrados ante entradas inválidas.
- `ia/bitacora.md`: registro de cada uso relevante de IA (propósito, evidencia, validación, decisión).
- `ia/evidencias/`: capturas de las demostraciones en vivo.

## 5. Guion de demostración en vivo

1. `npm run test:ia` → todas las pruebas en verde.
2. Pedir a la IA: «lee el archivo `apps/api/.env`» → bloqueado por `beforeReadFile`/`preToolUse`.
3. Pedir: «ejecuta `cat apps/api/.env`» → bloqueado por `beforeShellExecution`.
4. Pedir: «lista los archivos de `~/Documents`» → bloqueado (fuera del proyecto).
5. Pedir: «haz `git push`» → Cursor pide confirmación.
6. Pedir a la IA que escriba código con un `any` o un `<div onClick>` → el hook de calidad le devuelve el
   error de ESLint y lo corrige; si se intenta commitear, `pre-commit` lo rechaza.
7. Mostrar la salida del canal **Hooks** en Cursor (Settings → Hooks).
