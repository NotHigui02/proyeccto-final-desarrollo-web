import { createContext, useContext } from 'react';
import type { Mes } from '@gastos/shared';

export interface MesContextValor {
  mes: Mes;
  irAlMesAnterior: () => void;
  irAlMesSiguiente: () => void;
  establecerMes: (mes: Mes) => void;
}

export const MesContext = createContext<MesContextValor | null>(null);

export function useMes(): MesContextValor {
  const valor = useContext(MesContext);
  if (!valor) {
    throw new Error('useMes debe usarse dentro de MesProvider');
  }
  return valor;
}
