import type {
  LimitadorFrecuencia,
  ResultadoLimite,
} from '../../application/ports/limitador-frecuencia.js';

interface Ventana {
  inicioMs: number;
  contador: number;
}

export class LimitadorMemoria implements LimitadorFrecuencia {
  private readonly ventanas = new Map<string, Ventana>();

  constructor(
    private readonly maximo: number,
    private readonly ventanaMs: number,
    private readonly ahora: () => number = () => Date.now(),
  ) {}

  intentar(clave: string): Promise<ResultadoLimite> {
    const ahora = this.ahora();
    const actual = this.ventanas.get(clave);

    if (!actual || ahora - actual.inicioMs >= this.ventanaMs) {
      this.ventanas.set(clave, { inicioMs: ahora, contador: 1 });
      return Promise.resolve({ permitido: true });
    }

    if (actual.contador >= this.maximo) {
      const reintentarEnSegundos = Math.max(
        1,
        Math.ceil((actual.inicioMs + this.ventanaMs - ahora) / 1000),
      );
      return Promise.resolve({ permitido: false, reintentarEnSegundos });
    }

    actual.contador += 1;
    return Promise.resolve({ permitido: true });
  }
}
