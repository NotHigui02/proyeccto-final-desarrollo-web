import type { Reloj } from '../ports/reloj.js';

export interface EstadoSalud {
  estado: 'ok';
  fecha: string;
}

export class ObtenerEstadoSalud {
  constructor(private readonly reloj: Reloj) {}

  ejecutar(): EstadoSalud {
    return { estado: 'ok', fecha: this.reloj.ahora().toISOString() };
  }
}
