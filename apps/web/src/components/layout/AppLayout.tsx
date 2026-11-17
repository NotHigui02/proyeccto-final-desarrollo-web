import { NavLink, Outlet, useNavigate } from 'react-router';
import { useSesion } from '../../context/sesion';
import styles from './AppLayout.module.css';

const ENLACES = [
  { ruta: '/', texto: 'Resumen', exacta: true },
  { ruta: '/movimientos', texto: 'Movimientos', exacta: true },
  { ruta: '/movimientos/nuevo', texto: 'Nuevo movimiento', exacta: true },
  { ruta: '/categorias', texto: 'Categorías', exacta: true },
] as const;

export function AppLayout() {
  const { estado, cerrar } = useSesion();
  const navigate = useNavigate();

  async function manejarCerrar() {
    await cerrar();
    await navigate('/login');
  }

  return (
    <>
      <a className={styles.saltar} href="#contenido">
        Saltar al contenido
      </a>
      <header className={styles.cabecera}>
        <p className={styles.marca}>Gastos con gráficos</p>
        <nav aria-label="Principal">
          <ul className={styles.enlaces}>
            {ENLACES.map((enlace) => (
              <li key={enlace.ruta}>
                <NavLink
                  to={enlace.ruta}
                  end={enlace.exacta}
                  className={({ isActive }) => (isActive ? styles.activo : styles.enlace)}
                >
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
            <li>
              <button type="button" className={styles.enlace} onClick={() => void manejarCerrar()}>
                Cerrar sesión
                {estado.tipo === 'autenticado' && estado.usuario.correo
                  ? ` (${estado.usuario.correo})`
                  : ''}
              </button>
            </li>
          </ul>
        </nav>
      </header>
      <main id="contenido" tabIndex={-1} className={styles.principal}>
        <Outlet />
      </main>
      <footer className={styles.pie}>
        <p>Proyecto final · Desarrollo web</p>
      </footer>
    </>
  );
}
