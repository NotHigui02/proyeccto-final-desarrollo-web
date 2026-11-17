import { formatearCOP } from '@gastos/shared';
import styles from './TotalesMes.module.css';

interface Props {
  ingresosCentavos: number;
  gastosCentavos: number;
  saldoCentavos: number;
}

export function TotalesMes({ ingresosCentavos, gastosCentavos, saldoCentavos }: Props) {
  return (
    <ul className={styles.lista} aria-label="Totales del mes">
      <li className={styles.item}>
        <span className={styles.etiqueta}>Ingresos</span>
        <span className={styles.valor}>{formatearCOP(ingresosCentavos)}</span>
      </li>
      <li className={styles.item}>
        <span className={styles.etiqueta}>Gastos</span>
        <span className={styles.valor}>{formatearCOP(gastosCentavos)}</span>
      </li>
      <li className={styles.item}>
        <span className={styles.etiqueta}>Saldo</span>
        <span className={styles.valor}>{formatearCOP(saldoCentavos)}</span>
      </li>
    </ul>
  );
}
