import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BotonExportarCsv } from '../src/components/ui/BotonExportarCsv';

describe('BotonExportarCsv', () => {
  it('enlaza la descarga del mes con atributo download', () => {
    render(<BotonExportarCsv mes="2026-11" />);
    const enlace = screen.getByRole('link', { name: 'Exportar CSV' });
    expect(enlace).toHaveAttribute('href', '/api/movimientos/exportar?mes=2026-11');
    expect(enlace).toHaveAttribute('download', 'movimientos-2026-11.csv');
  });
});
