import { z } from 'zod';

export const mesSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'El mes debe tener el formato AAAA-MM');

export type Mes = z.infer<typeof mesSchema>;
