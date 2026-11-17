import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Outlet } from 'react-router';
import { cerrarSesion, iniciarSesion, obtenerUsuarioActual } from '../services/authCliente';
import { SesionContext, type EstadoSesion, type SesionContextValor } from './sesion';

export function SesionProvider({ children }: { children?: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSesion>({ tipo: 'carga' });

  const refrescar = useCallback(async () => {
    try {
      const usuario = await obtenerUsuarioActual();
      setEstado(usuario ? { tipo: 'autenticado', usuario } : { tipo: 'anonimo' });
    } catch {
      setEstado({ tipo: 'anonimo' });
    }
  }, []);

  useEffect(() => {
    void refrescar();
  }, [refrescar]);

  const iniciar = useCallback(async (correo: string, contraseña: string) => {
    const usuario = await iniciarSesion(correo, contraseña);
    setEstado({ tipo: 'autenticado', usuario });
  }, []);

  const cerrar = useCallback(async () => {
    await cerrarSesion();
    setEstado({ tipo: 'anonimo' });
  }, []);

  const valor = useMemo<SesionContextValor>(
    () => ({ estado, iniciar, cerrar, refrescar }),
    [estado, iniciar, cerrar, refrescar],
  );

  return <SesionContext.Provider value={valor}>{children ?? <Outlet />}</SesionContext.Provider>;
}
