import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormularioMovimiento } from '../src/components/forms/FormularioMovimiento';

const categorias = [{ id: 'cat-1', nombre: 'Comida', color: '#0B5D4B' }];

describe('FormularioMovimiento', () => {
  it('muestra error si el monto es inválido', async () => {
    const usuario = userEvent.setup();
    const onEnviar = vi.fn();
    render(
      <FormularioMovimiento
        categorias={categorias}
        textoEnvio="Registrar movimiento"
        onEnviar={onEnviar}
      />,
    );

    await usuario.type(screen.getByLabelText('Monto (pesos)'), '0');
    await usuario.selectOptions(screen.getByLabelText('Categoría'), 'cat-1');
    await usuario.click(screen.getByRole('button', { name: 'Registrar movimiento' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/monto/i);
    expect(onEnviar).not.toHaveBeenCalled();
  });

  it('envía los datos válidos con monto en centavos', async () => {
    const usuario = userEvent.setup();
    const onEnviar = vi.fn().mockResolvedValue(undefined);
    render(
      <FormularioMovimiento
        categorias={categorias}
        textoEnvio="Registrar movimiento"
        onEnviar={onEnviar}
      />,
    );

    await usuario.click(screen.getByRole('radio', { name: 'Ingreso' }));
    await usuario.type(screen.getByLabelText('Monto (pesos)'), '12.500');
    await usuario.selectOptions(screen.getByLabelText('Categoría'), 'cat-1');
    await usuario.clear(screen.getByLabelText('Fecha'));
    await usuario.type(screen.getByLabelText('Fecha'), '2024-01-15');
    await usuario.type(screen.getByLabelText('Nota (opcional)'), 'Pago');
    await usuario.click(screen.getByRole('button', { name: 'Registrar movimiento' }));

    expect(onEnviar).toHaveBeenCalledWith({
      tipo: 'ingreso',
      montoCentavos: 1_250_000,
      categoriaId: 'cat-1',
      nota: 'Pago',
      fecha: '2024-01-15',
      comprobanteUrl: null,
    });
  });
});
