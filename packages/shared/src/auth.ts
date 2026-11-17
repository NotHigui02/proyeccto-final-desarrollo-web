import { z } from 'zod';

export const rolSchema = z.enum(['usuario', 'admin']);

export const usuarioSesionSchema = z.strictObject({
  uid: z.string().min(1),
  correo: z.email().nullable(),
  rol: rolSchema,
});

export const crearSesionSchema = z.strictObject({
  idToken: z.string().min(1, 'El idToken es obligatorio'),
});

export type Rol = z.infer<typeof rolSchema>;
export type UsuarioSesion = z.infer<typeof usuarioSesionSchema>;
export type CrearSesion = z.infer<typeof crearSesionSchema>;
