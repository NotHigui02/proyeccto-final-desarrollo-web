import { Navigate, Outlet, useLocation } from 'react-router';
import { EstadoCarga } from '../components/ui/EstadoCarga';
import { useSesion } from '../context/sesion';

/** Redirige a /login si no hay sesión. No es la seguridad real: la API verifica la cookie. */
export function GuardiaSesion() {
  const { estado } = useSesion();
  const ubicacion = useLocation();

  if (estado.tipo === 'carga') {
    return <EstadoCarga mensaje="Comprobando sesión…" />;
  }

  if (estado.tipo === 'anonimo') {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }

  return <Outlet />;
}
