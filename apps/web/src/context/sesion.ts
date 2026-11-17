import type { UsuarioSesion } from '@gastos/shared';
import { createContext, useContext } from 'react';

export type EstadoSesion =
  { tipo: 'carga' } | { tipo: 'anonimo' } | { tipo: 'autenticado'; usuario: UsuarioSesion };

export interface SesionContextValor {
  estado: EstadoSesion;
  iniciar: (correo: string, contraseña: string) => Promise<void>;
  cerrar: () => Promise<void>;
  refrescar: () => Promise<void>;
}

export const SesionContext = createContext<SesionContextValor | null>(null);

export function useSesion(): SesionContextValor {
  const valor = useContext(SesionContext);
  if (!valor) {
    throw new Error('useSesion debe usarse dentro de SesionProvider');
  }
  return valor;
}
