import type { UsuarioSesion } from '@gastos/shared';

declare module 'fastify' {
  interface FastifyRequest {
    usuario?: UsuarioSesion;
  }
}

export {};
