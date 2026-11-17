import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rutas } from '../src/app/rutas';

vi.mock('../src/services/authCliente', () => ({
  obtenerUsuarioActual: vi.fn().mockResolvedValue({
    uid: 'usuario-demo',
    correo: 'demo@example.com',
    rol: 'usuario',
  }),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn().mockResolvedValue(undefined),
}));

describe('SelectorMes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cambia la URL a ?mes= al navegar de mes', async () => {
    const usuario = userEvent.setup();
    const router = createMemoryRouter(rutas, { initialEntries: ['/?mes=2026-11'] });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Mes anterior' })).toBeInTheDocument();
    });
    await usuario.click(screen.getByRole('button', { name: 'Mes anterior' }));

    expect(router.state.location.search).toBe('?mes=2026-10');
  });
});
