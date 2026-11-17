import { NavLink, Outlet } from 'react-router';
import styles from './AppLayout.module.css';

const ENLACES = [
  { ruta: '/', texto: 'Resumen', exacta: true },
  { ruta: '/movimientos', texto: 'Movimientos', exacta: true },
  { ruta: '/movimientos/nuevo', texto: 'Nuevo movimiento', exacta: true },
  { ruta: '/categorias', texto: 'Categorías', exacta: true },
] as const;

export function AppLayout() {
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
