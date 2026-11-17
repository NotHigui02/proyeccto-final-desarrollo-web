# Instrucciones para asistentes de IA — Gastos con gráficos (proyecto 05)

Este archivo es la fuente principal de reglas para cualquier asistente de IA que trabaje en el repositorio.
Las reglas específicas por carpeta están en `.cursor/rules/`. Las restricciones de seguridad se **aplican
automáticamente** con hooks (`.cursor/hooks.json`); no dependen de que la IA las recuerde.

## Qué es el proyecto

Registro de ingresos y gastos con gráficos por categoría y por mes **dibujados a mano en SVG** (sin librerías
de gráficos). El enunciado oficial está en `Proyectos/05-gastos-con-graficos.md` y los specs de trabajo en
`specs/`. Si hay conflicto, manda el enunciado salvo las adaptaciones documentadas en `specs/00-vision-y-arquitectura.md`
(Fastify en lugar de Route Handlers de Next.js y React + Vite en lugar de Next.js).

## Stack

- **Monorepo** con npm workspaces, Node 22, TypeScript estricto, ESM.
- `packages/shared`: esquemas **Zod** y utilidades puras compartidas por cliente y servidor (las reglas de
  validación se escriben **una sola vez** aquí).
- `apps/api`: **Fastify** con arquitectura **limpia/hexagonal**, Firebase Admin SDK (Auth + Firestore),
  Vercel Blob.
- `apps/web`: **React 19 + Vite + React Router**, arquitectura **por componentes**, CSS Modules, Firebase Auth
  (solo el SDK de autenticación).
- Pruebas: **Vitest** (+ React Testing Library en web; `app.inject` en la API). Calidad: ESLint (strict
  type-checked + jsx-a11y + reglas de capas), Prettier, Husky + lint-staged, CI en GitHub Actions.

## Comandos

| Comando             | Para qué                                                            |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Levanta shared (watch), API (`:3000`) y web (`:5173`, proxy `/api`) |
| `npm run check`     | Formato + lint + tipos + pruebas + pruebas de la config de IA       |
| `npm run lint`      | ESLint sin advertencias permitidas                                  |
| `npm run typecheck` | TypeScript en todos los paquetes                                    |
| `npm test`          | Vitest en todos los paquetes                                        |
| `npm run test:ia`   | Pruebas que demuestran las restricciones de la IA (`ia/pruebas`)    |

Antes de dar una tarea por terminada, ejecute `npm run check` y reporte el resultado real.

## Estructura

```text
apps/api/src/
├── domain/           # entidades, value objects, errores de dominio. Sin dependencias externas.
├── application/
│   ├── ports/        # interfaces (repositorios, reloj, auth, almacenamiento)
│   └── use-cases/    # un caso de uso por clase; reciben puertos por constructor
├── infrastructure/   # adaptadores: http (Fastify), firebase, blob, config
├── app.ts            # construirApp(entorno, dependencias): ensambla Fastify
├── container.ts      # raíz de composición: único lugar que instancia adaptadores
└── server.ts         # arranque
apps/web/src/
├── app/              # rutas y proveedores
├── components/       # UI reutilizable y accesible (layout, ui, charts, forms)
├── pages/            # una página por ruta, compone componentes
├── hooks/  context/  services/ (cliente HTTP)  lib/
packages/shared/src/  # esquemas Zod, tipos y utilidades puras
specs/                # specs de trabajo (uno por bloque funcional)
ia/                   # bitácora de IA y pruebas de la configuración
```

## Reglas de diseño (obligatorias)

- **SOLID** y **inversión de dependencias**: los casos de uso dependen de interfaces en `application/ports`,
  nunca de Firebase, Fastify ni Vercel. Los adaptadores implementan los puertos y se conectan solo en
  `container.ts`. ESLint bloquea los imports que rompen las capas.
- Dinero siempre en **enteros de centavos**; nunca `number` con decimales para montos.
- Fechas de negocio `YYYY-MM-DD`; marcas de tiempo ISO 8601 UTC.
- Errores de la API siempre `{ "error": "…", "detalles"?: [{ "campo", "mensaje" }] }` usando las clases de
  `domain/errors`; nunca exponer detalles internos en un `500`.
- El `uid` sale **siempre** de la sesión verificada, nunca del cuerpo ni de la URL.
- Zod en modo estricto (`z.strictObject`) para todo cuerpo de entrada.
- React: componentes funcionales pequeños, HTML semántico, accesibilidad WCAG 2.2 AA, mobile-first,
  estados de carga/vacío/error/reintento en toda vista que lea datos.
- El navegador **nunca** importa `firebase/firestore` ni `firebase-admin`.
- Sin librerías de gráficos: SVG a mano con `role="img"`, `aria-label` y tabla alternativa.
- Código, nombres y mensajes en **español**; comentarios solo cuando expliquen una restricción no evidente.

## Lo que la IA NO debe hacer

- Leer, mostrar, copiar ni crear archivos `.env*` (excepto `.env.example`), claves, certificados o cuentas de
  servicio. Si necesita una variable, pida al usuario que la configure.
- Salir de la carpeta del proyecto (rutas absolutas externas, `~`, `..`).
- Ejecutar sin permiso: `git push`, instalar/quitar dependencias, `npx`, `curl`/`wget`, `vercel`,
  `firebase`, borrados recursivos o reescritura de historial. Los hooks piden confirmación.
- Agregar dependencias sin justificarlas (¿existe ya una solución nativa o en el proyecto?).
- Desactivar reglas de ESLint, usar `any`, `@ts-ignore` o `!important` para "hacer pasar" algo.
- Afirmar que algo funciona sin haberlo ejecutado.

## Flujo de trabajo

1. Elegir el siguiente spec en `specs/README.md` y leerlo completo.
2. Implementar por pasos pequeños con pruebas (primero dominio/casos de uso, luego adaptadores y UI).
3. Ejecutar `npm run check`.
4. Actualizar el estado del spec y registrar en `ia/bitacora.md` lo que hizo la IA (propósito, evidencia,
   validación, decisión).
5. Commit con Conventional Commits en español (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
