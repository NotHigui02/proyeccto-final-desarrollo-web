import type { UsuarioSesion } from '@gastos/shared';

/** Credenciales extraídas del HTTP (sin acoplar Fastify al dominio). */
export interface CredencialesPeticion {
  cookieSesion?: string;
  authorization?: string;
}

export interface RequerirUsuario {
  ejecutar(credenciales: CredencialesPeticion): Promise<UsuarioSesion>;
}
