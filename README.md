# Gastos con gráficos

Registro de ingresos y gastos con gráficos por categoría y por mes, dibujados a mano en SVG.
Proyecto final de Desarrollo Web (proyecto 05). Enunciado: [`Proyectos/05-gastos-con-graficos.md`](Proyectos/05-gastos-con-graficos.md).

## Arquitectura

Monorepo con npm workspaces:

| Paquete           | Tecnología                                              | Arquitectura           |
| ----------------- | ------------------------------------------------------- | ---------------------- |
| `apps/api`        | Fastify 5, TypeScript, Zod, Firebase Admin, Vercel Blob | Limpia / hexagonal     |
| `apps/web`        | React 19, Vite, React Router, CSS Modules               | Por componentes        |
| `packages/shared` | Zod                                                     | Esquemas y lógica pura |

Decisiones y adaptaciones al enunciado: [`specs/00-vision-y-arquitectura.md`](specs/00-vision-y-arquitectura.md).
Plan de trabajo: [`specs/README.md`](specs/README.md).

## Requisitos

- Node.js 22 (`nvm use`)
- npm 10

## Puesta en marcha

```bash
npm install
cp apps/api/.env.example apps/api/.env      # completar valores reales (nunca en Git)
cp apps/web/.env.example apps/web/.env.local
npm run dev                                 # API en :3000, web en :5173 (proxy /api)
```

Comprobar: `http://localhost:5173` y `http://localhost:5173/api/salud`.

## Scripts

| Script            | Descripción                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | shared (watch) + API + web                       |
| `npm run check`   | formato, lint, tipos, pruebas y pruebas de la IA |
| `npm test`        | pruebas Vitest de todos los paquetes             |
| `npm run test:ia` | pruebas de la configuración de IA                |
| `npm run build`   | compila shared, API y web                        |

## Configuración de IA

Ver [`ia/README.md`](ia/README.md) y [`AGENTS.md`](AGENTS.md). Bitácora: [`ia/bitacora.md`](ia/bitacora.md).
