import { resumenSchema, type Resumen } from '@gastos/shared';

export class ErrorApi extends Error {
  constructor(
    message: string,
    readonly estado: number,
  ) {
    super(message);
    this.name = 'ErrorApi';
  }
}

export async function obtenerResumen(mes: string, señal?: AbortSignal): Promise<Resumen> {
  const respuesta = await fetch(`/api/resumen?mes=${encodeURIComponent(mes)}`, {
    signal: señal,
    headers: { Accept: 'application/json' },
  });

  if (!respuesta.ok) {
    let mensaje = `Error ${String(respuesta.status)}`;
    try {
      const cuerpo = (await respuesta.json()) as { error?: string };
      if (typeof cuerpo.error === 'string') mensaje = cuerpo.error;
    } catch {
      // cuerpo no JSON
    }
    throw new ErrorApi(mensaje, respuesta.status);
  }

  return resumenSchema.parse(await respuesta.json());
}
