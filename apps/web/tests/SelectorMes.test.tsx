import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { rutas } from '../src/app/rutas';

describe('SelectorMes', () => {
  it('cambia la URL a ?mes= al navegar de mes', async () => {
    const usuario = userEvent.setup();
    const router = createMemoryRouter(rutas, { initialEntries: ['/?mes=2026-11'] });
    render(<RouterProvider router={router} />);

    await usuario.click(screen.getByRole('button', { name: 'Mes anterior' }));

    expect(router.state.location.search).toBe('?mes=2026-10');
  });
});
