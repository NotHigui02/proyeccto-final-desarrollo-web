import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTamanoContenedor } from '../src/hooks/useTamanoContenedor';

function Sonda() {
  const { ref, ancho, soportaResizeObserver } = useTamanoContenedor();
  return (
    <div ref={ref} data-testid="caja" style={{ width: 200 }}>
      {ancho}:{soportaResizeObserver ? 'si' : 'no'}
    </div>
  );
}

describe('useTamanoContenedor', () => {
  it('usa ResizeObserver cuando está disponible', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        disconnect = disconnect;
        unobserve = vi.fn();
      },
    );

    render(<Sonda />);
    expect(observe).toHaveBeenCalled();
    expect(screen.getByTestId('caja').textContent).toMatch(/si$/);
  });

  it('cae a tamaño fijo si no hay ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    render(<Sonda />);
    expect(screen.getByTestId('caja').textContent).toMatch(/no$/);
  });
});
