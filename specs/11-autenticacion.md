# 11 · Autenticación y sesión

**Estado:** Pendiente · **Hito:** 4 · **Enunciado:** §9.1, §9.6

## Objetivo

Inicio de sesión con Firebase Auth en el navegador y cookie de sesión HttpOnly verificada en cada ruta
privada de la API.

## API

| Método y ruta             | Cuerpo        | Respuesta                                                                              |
| ------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| `POST /api/auth/sesion`   | `{ idToken }` | `204` + `Set-Cookie: sesion=…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=432000` |
| `DELETE /api/auth/sesion` | —             | `204` + borra cookie (revoca refresh tokens)                                           |
| `GET /api/auth/yo`        | —             | `200 { usuario: { uid, correo, rol } }` · `401`                                        |

## Diseño

- Puerto `VerificadorSesion` (`crearCookie(idToken)`, `verificarCookie(cookie)`, `verificarIdToken(token)`,
  `revocar(uid)`) con adaptador Firebase Admin.
- `requerirUsuario` como hook `preHandler` de Fastify: cookie `sesion` o `Authorization: Bearer` (para
  Bruno); deja `request.usuario` tipado. Exige `auth_time` reciente al crear la cookie.
- Roles por custom claims (`rol`); `requerirRol('admin')` → `403`.
- Web: `/login` (correo y contraseña, `autocomplete`, permite pegar y gestores de contraseñas),
  `SesionContext`, guardia de rutas que redirige a `/login` si `GET /api/auth/yo` responde `401`,
  cierre de sesión. Firebase Auth se carga de forma diferida.

## Tareas

- [ ] Puerto, adaptador y `requerirUsuario` + pruebas (`401` sin cookie, `401` cookie inválida).
- [ ] Rutas de sesión + pruebas.
- [ ] Todas las rutas privadas usan `requerirUsuario`; prueba de autorización por objeto (`404`).
- [ ] Página de login, contexto de sesión y guardia + pruebas RTL.

## Dependencias por aprobar

`firebase` (en `apps/web`, solo `firebase/app` y `firebase/auth`).
