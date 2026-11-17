import type { Categoria, Movimiento } from '@gastos/shared';

/** Usuario de desarrollo hasta el spec de autenticación. */
export const UID_DEMO = 'usuario-demo';

export const CATEGORIAS_SEMILLA: Categoria[] = [
  { id: 'sueldo', nombre: 'Sueldo', color: '#0B5D4B' },
  { id: 'comida', nombre: 'Comida', color: '#E11D48' },
  { id: 'transporte', nombre: 'Transporte', color: '#2563EB' },
  { id: 'hogar', nombre: 'Hogar', color: '#CA8A04' },
];

export const MOVIMIENTOS_SEMILLA: Movimiento[] = [
  mov('i-06', 'ingreso', 2_800_000, 'sueldo', '2026-06-01'),
  mov('g-06a', 'gasto', 900_000, 'comida', '2026-06-10'),
  mov('g-06b', 'gasto', 400_000, 'transporte', '2026-06-15'),
  mov('i-07', 'ingreso', 2_800_000, 'sueldo', '2026-07-01'),
  mov('g-07a', 'gasto', 1_000_000, 'comida', '2026-07-08'),
  mov('g-07b', 'gasto', 450_000, 'hogar', '2026-07-20'),
  mov('i-08', 'ingreso', 2_900_000, 'sueldo', '2026-08-01'),
  mov('g-08a', 'gasto', 1_100_000, 'comida', '2026-08-05'),
  mov('g-08b', 'gasto', 500_000, 'transporte', '2026-08-18'),
  mov('i-09', 'ingreso', 2_900_000, 'sueldo', '2026-09-01'),
  mov('g-09a', 'gasto', 1_200_000, 'comida', '2026-09-12'),
  mov('g-09b', 'gasto', 600_000, 'hogar', '2026-09-22'),
  mov('i-10', 'ingreso', 3_000_000, 'sueldo', '2026-10-01'),
  mov('g-10a', 'gasto', 1_150_000, 'comida', '2026-10-07'),
  mov('g-10b', 'gasto', 480_000, 'transporte', '2026-10-14'),
  mov('i-11', 'ingreso', 3_000_000, 'sueldo', '2026-11-01'),
  mov('g-11a', 'gasto', 1_250_000, 'comida', '2026-11-05'),
  mov('g-11b', 'gasto', 500_000, 'transporte', '2026-11-08'),
  mov('g-11c', 'gasto', 750_000, 'hogar', '2026-11-12'),
];

function mov(
  id: string,
  tipo: 'ingreso' | 'gasto',
  montoCentavos: number,
  categoriaId: string,
  fecha: string,
): Movimiento {
  return { id, tipo, montoCentavos, categoriaId, nota: null, fecha, comprobanteUrl: null };
}
