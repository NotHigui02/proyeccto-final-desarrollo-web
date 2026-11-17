# Gastos con gráficos

Registro de ingresos y gastos con gráficos por categoría y por mes, dibujados a mano en SVG.
Proyecto final de Desarrollo Web (proyecto 05). Enunciado: [`Proyectos/05-gastos-con-graficos.md`](Proyectos/05-gastos-con-graficos.md).

**URL desplegada:** _pendiente de `vercel deploy --prod`._

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

## Puesta en marcha (local)

```bash
npm install
cp apps/api/.env.example apps/api/.env      # completar valores reales (nunca en Git)
cp apps/web/.env.example apps/web/.env.local
npm run dev                                 # API en :3000, web en :5173 (proxy /api)
```

Comprobar: `http://localhost:5173` y `http://localhost:5173/api/salud`.

## Despliegue en Vercel (mismo origen)

1. Crear un proyecto enlazado a este repo (raíz del monorepo).
2. Configurar variables de entorno en el panel (no en Git):

| Variable (servidor)     | Notas                                    |
| ----------------------- | ---------------------------------------- |
| `NODE_ENV`              | `production`                             |
| `WEB_ORIGIN`            | URL canónica `https://…vercel.app`       |
| `FIREBASE_PROJECT_ID`   | Admin SDK                                |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK                                |
| `FIREBASE_PRIVATE_KEY`  | Con `\n` literales; Vercel los convierte |
| `BLOB_READ_WRITE_TOKEN` | Store Blob **privado**                   |

| Variable (build / web)      | Notas             |
| --------------------------- | ----------------- |
| `VITE_FIREBASE_API_KEY`     | Pública (cliente) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Pública           |
| `VITE_FIREBASE_PROJECT_ID`  | Pública           |
| `VITE_FIREBASE_APP_ID`      | Pública           |

3. En Firebase Authentication → Authorized domains, añadir el dominio de Vercel.
4. Build: lo define `vercel.json` (`build:shared` + API + web). Estáticos en `apps/web/dist`; `/api/*` → `api/index.mjs` (Fastify).
5. Desplegar: `npx vercel deploy --prod` (pide permiso de la IA / ejecutar tú).
6. Verificar: `GET /api/auth/yo` (401 sin cookie) e inicio de sesión en el navegador.

Documentación API: [`openapi.yaml`](openapi.yaml). Colección: [`bruno/`](bruno/).

## Scripts

| Script            | Descripción                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | shared (watch) + API + web                       |
| `npm run check`   | formato, lint, tipos, pruebas y pruebas de la IA |
| `npm test`        | pruebas Vitest de todos los paquetes             |
| `npm run test:ia` | pruebas de la configuración de IA                |
| `npm run build`   | compila shared, API y web                        |

## Lista de verificación de seguridad (§16)

- [x] Ningún secreto en Git ni en variables `VITE_*` (excepto la configuración web de Firebase, que es pública).
- [x] Reglas de Firestore: `allow read, write: if false`; el navegador no importa `firebase/firestore`.
- [x] Cada ruta privada verifica la sesión y la autorización por objeto; la guardia de React no es la única defensa.
- [x] Entradas validadas con Zod; contenido de usuarios escapado (sin `dangerouslySetInnerHTML`).
- [x] Cookie de sesión `HttpOnly`, `Secure` (producción), `SameSite=Lax`; comprobación de `Origin` al modificar datos.
- [x] Archivos validados por tipo y tamaño en el servidor; `pathname` verificado; cuotas de Blob revisadas.
- [ ] `npm audit` revisado y sin secretos en los logs (revisar antes de la entrega).
- [ ] Evidencias de calidad de la sección 14 entregadas (ver [`calidad/CALIDAD.md`](calidad/CALIDAD.md)).
- [x] Configuración de IA propia (sección 15): la IA no lee `.env*` ni claves y no sale de la carpeta del proyecto; evidencias en `ia/`.

## Calidad y accesibilidad

Metas y plantilla de evidencias: [`calidad/CALIDAD.md`](calidad/CALIDAD.md).

## Configuración de IA

Ver [`ia/README.md`](ia/README.md) y [`AGENTS.md`](AGENTS.md). Bitácora: [`ia/bitacora.md`](ia/bitacora.md).
