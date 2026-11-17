import styles from './Estados.module.css';

export function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <p className={styles.vacio} role="status">
      {mensaje}
    </p>
  );
}
