import { describe, expect, it } from 'vitest';
import { mesSchema } from '../src/mes.js';

describe('mesSchema', () => {
  it('acepta un mes con formato AAAA-MM', () => {
    expect(mesSchema.safeParse('2026-11').success).toBe(true);
  });

  it.each(['2026-13', '2026-1', '26-11', '2026/11', ''])('rechaza %s', (valor) => {
    expect(mesSchema.safeParse(valor).success).toBe(false);
  });
});
