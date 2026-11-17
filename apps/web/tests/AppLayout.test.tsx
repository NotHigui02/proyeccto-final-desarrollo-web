import { render, screen, waitFor } from '@testing-library/react';
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

function renderizarEn(ruta: string) {
  render(<RouterProvider router={createMemoryRouter(rutas, { initialEntries: [ruta] })} />);
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expone los landmarks y el enlace para saltar al contenido', async () => {
    renderizarEn('/');

    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      '#contenido',
    );
  });

  it('marca el enlace de la página actual y muestra un solo h1', async () => {
    renderizarEn('/categorias');

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Categorías' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });
  });

  it('muestra la página 404 en rutas desconocidas', async () => {
    renderizarEn('/no-existe');

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
      ).toBeInTheDocument();
    });
  });
});
