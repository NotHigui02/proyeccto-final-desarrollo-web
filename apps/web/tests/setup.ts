import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function urlDe(entrada: RequestInfo | URL): string {
  if (typeof entrada === 'string') return entrada;
  if (entrada instanceof URL) return entrada.href;
  return entrada.url;
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn((entrada: RequestInfo | URL) => {
      const url = urlDe(entrada);
      if (url.includes('/api/resumen')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              mes: '2026-11',
              ingresosCentavos: 3_000_000,
              gastosCentavos: 2_500_000,
              saldoCentavos: 500_000,
              porCategoria: [
                {
                  categoriaId: 'comida',
                  nombre: 'Comida',
                  color: '#E11D48',
                  gastoCentavos: 1_250_000,
                },
              ],
              evolucion: [
                { mes: '2026-11', ingresosCentavos: 3_000_000, gastosCentavos: 2_500_000 },
              ],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }
      if (url.includes('/api/categorias')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              items: [{ id: 'comida', nombre: 'Comida', color: '#E11D48' }],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404 }),
      );
    }),
  );
});
