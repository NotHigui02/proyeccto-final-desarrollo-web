import { usuarioSesionSchema, type UsuarioSesion } from '@gastos/shared';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { z } from 'zod';
import { obtenerAuth } from '../lib/firebase';
import { ErrorApi } from './clienteApi';

const respuestaYoSchema = z.strictObject({
  usuario: usuarioSesionSchema,
});

async function leerError(respuesta: Response): Promise<ErrorApi> {
  let mensaje = `Error ${String(respuesta.status)}`;
  try {
    const cuerpo = (await respuesta.json()) as { error?: string };
    if (typeof cuerpo.error === 'string') mensaje = cuerpo.error;
  } catch {
    // cuerpo no JSON
  }
  return new ErrorApi(mensaje, respuesta.status);
}

export async function obtenerUsuarioActual(señal?: AbortSignal): Promise<UsuarioSesion | null> {
  const respuesta = await fetch('/api/auth/yo', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal: señal,
  });
  if (respuesta.status === 401) return null;
  if (!respuesta.ok) throw await leerError(respuesta);
  return respuestaYoSchema.parse(await respuesta.json()).usuario;
}

export async function iniciarSesion(correo: string, contraseña: string): Promise<UsuarioSesion> {
  const credencial = await signInWithEmailAndPassword(obtenerAuth(), correo, contraseña);
  const idToken = await credencial.user.getIdToken();

  const respuesta = await fetch('/api/auth/sesion', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });
  if (!respuesta.ok) throw await leerError(respuesta);

  const usuario = await obtenerUsuarioActual();
  if (!usuario) throw new ErrorApi('No se pudo verificar la sesión', 401);
  return usuario;
}

export async function cerrarSesion(): Promise<void> {
  await fetch('/api/auth/sesion', {
    method: 'DELETE',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  try {
    await signOut(obtenerAuth());
  } catch {
    // si Firebase no estaba inicializado, basta con borrar la cookie
  }
}
