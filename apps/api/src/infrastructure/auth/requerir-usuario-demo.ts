import type { RequerirUsuario } from '../../application/ports/requerir-usuario.js';

/** Placeholder hasta Firebase Auth: la sesión se asume válida. */
export class RequerirUsuarioDemo implements RequerirUsuario {
  ejecutar(): Promise<void> {
    return Promise.resolve();
  }
}
