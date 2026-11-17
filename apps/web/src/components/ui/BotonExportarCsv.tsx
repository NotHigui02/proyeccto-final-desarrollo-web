import styles from './BotonExportarCsv.module.css';

interface Props {
  mes: string;
}

export function BotonExportarCsv({ mes }: Props) {
  const href = `/api/movimientos/exportar?mes=${encodeURIComponent(mes)}`;
  const nombre = `movimientos-${mes}.csv`;

  return (
    <p className={styles.envoltorio}>
      <a className={styles.enlace} href={href} download={nombre}>
        Exportar CSV
      </a>
    </p>
  );
}
