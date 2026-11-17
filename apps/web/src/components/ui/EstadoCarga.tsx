import styles from './Estados.module.css';

export function EstadoCarga({ mensaje = 'Cargando…' }: { mensaje?: string }) {
  return (
    <p className={styles.carga} role="status" aria-live="polite">
      {mensaje}
    </p>
  );
}
