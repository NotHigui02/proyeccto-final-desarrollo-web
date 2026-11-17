import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PresupuestoMes } from '../src/components/ui/PresupuestoMes';

describe('PresupuestoMes', () => {
  it('muestra alerta accesible al llegar al 80 % (CA-4)', () => {
    render(
      <PresupuestoMes
        mes="2026-11"
        gastosCentavos={800_000}
        presupuesto={{ mes: '2026-11', montoCentavos: 1_000_000 }}
        onActualizado={vi.fn()}
      />,
    );

    const alerta = screen.getByRole('status');
    expect(alerta).toHaveTextContent(/80 %/i);
    expect(alerta).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('anuncia excedido cuando se agota el presupuesto', () => {
    render(
      <PresupuestoMes
        mes="2026-11"
        gastosCentavos={1_200_000}
        presupuesto={{ mes: '2026-11', montoCentavos: 1_000_000 }}
        onActualizado={vi.fn()}
      />,
    );

    const aviso = screen.getByRole('status');
    expect(aviso).toHaveTextContent(/superado|agotado/i);
    expect(aviso).toHaveAttribute('aria-live', 'assertive');
  });
});
