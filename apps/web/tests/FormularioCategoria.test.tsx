import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormularioCategoria } from '../src/components/forms/FormularioCategoria';

describe('FormularioCategoria', () => {
  it('muestra error de validación si el nombre está vacío', async () => {
    const usuario = userEvent.setup();
    const onEnviar = vi.fn();
    render(<FormularioCategoria textoEnvio="Crear categoría" onEnviar={onEnviar} />);

    await usuario.clear(screen.getByLabelText('Nombre'));
    await usuario.click(screen.getByRole('button', { name: 'Crear categoría' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/nombre/i);
    expect(onEnviar).not.toHaveBeenCalled();
  });

  it('envía los datos válidos', async () => {
    const usuario = userEvent.setup();
    const onEnviar = vi.fn().mockResolvedValue(undefined);
    render(<FormularioCategoria textoEnvio="Crear categoría" onEnviar={onEnviar} />);

    await usuario.type(screen.getByLabelText('Nombre'), 'Salud');
    await usuario.click(screen.getByRole('button', { name: 'Crear categoría' }));

    expect(onEnviar).toHaveBeenCalledWith({
      nombre: 'Salud',
      color: '#0B5D4B',
    });
  });
});
