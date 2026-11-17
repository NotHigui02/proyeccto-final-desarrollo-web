export interface ResultadoLimite {
  permitido: boolean;
  reintentarEnSegundos?: number;
}

export interface LimitadorFrecuencia {
  intentar(clave: string): Promise<ResultadoLimite>;
}
