import { z } from 'zod';

const esquemaEntorno = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  WEB_ORIGIN: z.url().default('http://localhost:5173'),
});

export type Entorno = z.infer<typeof esquemaEntorno>;

export function cargarEntorno(fuente: Record<string, string | undefined>): Entorno {
  const resultado = esquemaEntorno.safeParse(fuente);
  if (!resultado.success) {
    throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(resultado.error)}`);
  }
  return resultado.data;
}
