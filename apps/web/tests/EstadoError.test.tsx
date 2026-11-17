import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EstadoError } from '../src/components/ui/EstadoError';

describe('EstadoError', () => {
  it('muestra el mensaje y permite reintentar', async () => {
    const usuario = userEvent.setup();
    const onReintentar = vi.fn();
    render(<EstadoError mensaje="Falló la carga" onReintentar={onReintentar} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falló la carga');
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onReintentar).toHaveBeenCalledOnce();
  });
});
