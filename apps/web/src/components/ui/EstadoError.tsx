import styles from './Estados.module.css';

export function EstadoError({
  mensaje,
  onReintentar,
}: {
  mensaje: string;
  onReintentar: () => void;
}) {
  return (
    <div className={styles.error} role="alert">
      <p>{mensaje}</p>
      <button type="button" className={styles.boton} onClick={onReintentar}>
        Reintentar
      </button>
    </div>
  );
}
