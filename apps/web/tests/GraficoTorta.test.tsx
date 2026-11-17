import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraficoTorta } from '../src/components/charts/GraficoTorta';

describe('GraficoTorta', () => {
  it('expone role img con nombre y tabla alternativa con los valores', () => {
    render(
      <GraficoTorta
        datos={[
          { categoriaId: 'comida', nombre: 'Comida', color: '#E11D48', gastoCentavos: 1_250_000 },
          {
            categoriaId: 'transporte',
            nombre: 'Transporte',
            color: '#2563EB',
            gastoCentavos: 500_000,
          },
        ]}
      />,
    );

    expect(screen.getByRole('img', { name: /gasto por categoría/i })).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: /datos del gasto por categoría/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /comida/i })).toHaveTextContent('$ 12.500');
    expect(screen.getByRole('row', { name: /transporte/i })).toHaveTextContent('$ 5.000');
  });
});
