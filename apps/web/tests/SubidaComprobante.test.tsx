import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubidaComprobante } from '../src/components/forms/SubidaComprobante';
import { SesionContext } from '../src/context/sesion';

vi.mock('@vercel/blob/client', () => ({
  upload: vi.fn().mockResolvedValue({
    pathname: 'usuarios/usuario-demo/comprobantes/m1.pdf',
    url: 'https://blob.ejemplo/m1.pdf',
  }),
}));

vi.mock('../src/services/clienteApi', () => ({
  registrarComprobante: vi.fn().mockResolvedValue({
    id: 'm1',
    tipo: 'gasto',
    montoCentavos: 1000,
    categoriaId: 'c1',
    nota: null,
    fecha: '2026-11-10',
    comprobanteUrl: 'https://blob.ejemplo/m1.pdf',
  }),
  eliminarComprobante: vi.fn().mockResolvedValue({
    id: 'm1',
    tipo: 'gasto',
    montoCentavos: 1000,
    categoriaId: 'c1',
    nota: null,
    fecha: '2026-11-10',
    comprobanteUrl: null,
  }),
  urlComprobante: (id: string) => `/api/movimientos/${id}/comprobante`,
  ErrorApi: class ErrorApi extends Error {
    constructor(
      message: string,
      readonly estado = 400,
    ) {
      super(message);
    }
  },
}));

vi.mock('../src/lib/reducirImagen', () => ({
  reducirArchivoSiEsImagen: vi.fn((archivo: File) => Promise.resolve(archivo)),
  extensionDeArchivo: () => 'pdf',
}));

describe('SubidaComprobante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('permite adjuntar un PDF y notifica el cambio', async () => {
    const usuario = userEvent.setup();
    const onCambio = vi.fn();
    const { upload } = await import('@vercel/blob/client');

    render(
      <SesionContext.Provider
        value={{
          estado: {
            tipo: 'autenticado',
            usuario: { uid: 'usuario-demo', correo: 'demo@example.com', rol: 'usuario' },
          },
          iniciar: vi.fn(),
          cerrar: vi.fn(),
          refrescar: vi.fn(),
        }}
      >
        <SubidaComprobante movimientoId="m1" comprobanteUrl={null} onCambio={onCambio} />
      </SesionContext.Provider>,
    );

    const input = screen.getByLabelText('Adjuntar comprobante');
    const archivo = new File(['%PDF'], 'ticket.pdf', { type: 'application/pdf' });
    await usuario.upload(input, archivo);

    await waitFor(() => {
      expect(upload).toHaveBeenCalled();
      expect(onCambio).toHaveBeenCalledWith('https://blob.ejemplo/m1.pdf');
    });
  });
});
