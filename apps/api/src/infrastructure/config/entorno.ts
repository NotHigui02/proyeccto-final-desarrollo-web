import { z } from 'zod';

const esquemaEntorno = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().min(1).default('127.0.0.1'),
    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    WEB_ORIGIN: z.url().default('http://localhost:5173'),
    FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    FIREBASE_CLIENT_EMAIL: z.email().optional(),
    FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
  })
  .superRefine((datos, contexto) => {
    if (datos.NODE_ENV === 'test') return;
    const obligatorias = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
    ] as const;
    for (const campo of obligatorias) {
      if (!datos[campo]) {
        contexto.addIssue({
          code: 'custom',
          path: [campo],
          message: 'Obligatoria fuera de test (Admin SDK)',
        });
      }
    }
  });

export type Entorno = z.infer<typeof esquemaEntorno>;

export function cargarEntorno(fuente: Record<string, string | undefined>): Entorno {
  const resultado = esquemaEntorno.safeParse(fuente);
  if (!resultado.success) {
    throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(resultado.error)}`);
  }
  return resultado.data;
}

export function clavePrivadaFirebase(valor: string): string {
  return valor.replace(/\\n/g, '\n');
}
