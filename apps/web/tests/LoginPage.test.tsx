import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { SesionProvider } from '../src/context/SesionProvider';
import { LoginPage } from '../src/pages/LoginPage';

const iniciarSesion = vi.fn();

vi.mock('../src/services/authCliente', () => ({
  obtenerUsuarioActual: vi.fn().mockResolvedValue(null),
  iniciarSesion: (...args: unknown[]) => iniciarSesion(...args) as Promise<unknown>,
  cerrarSesion: vi.fn(),
}));

describe('LoginPage', () => {
  it('permite completar correo y contraseña con autocomplete', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue({
      uid: 'u1',
      correo: 'demo@example.com',
      rol: 'usuario',
    });

    const router = createMemoryRouter(
      [
        {
          element: <SesionProvider />,
          children: [{ path: '/login', element: <LoginPage /> }],
        },
      ],
      { initialEntries: ['/login'] },
    );
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Correo')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Correo')).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('autocomplete', 'current-password');

    await usuario.type(screen.getByLabelText('Correo'), 'demo@example.com');
    await usuario.type(screen.getByLabelText('Contraseña'), 'secreto123');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(iniciarSesion).toHaveBeenCalledWith('demo@example.com', 'secreto123');
    });
  });
});
