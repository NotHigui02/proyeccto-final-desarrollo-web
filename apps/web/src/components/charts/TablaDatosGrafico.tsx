import { formatearCOP } from '@gastos/shared';
import styles from './TablaDatosGrafico.module.css';

export interface FilaGrafico {
  etiqueta: string;
  valorCentavos: number;
  patron?: string;
}

export function TablaDatosGrafico({
  titulo,
  filas,
  id,
}: {
  titulo: string;
  filas: readonly FilaGrafico[];
  id: string;
}) {
  return (
    <table className={styles.tabla} id={id}>
      <caption className={styles.caption}>{titulo}</caption>
      <thead>
        <tr>
          <th scope="col">Concepto</th>
          <th scope="col">Monto</th>
          {filas.some((fila) => fila.patron) ? <th scope="col">Patrón</th> : null}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={fila.etiqueta}>
            <th scope="row">{fila.etiqueta}</th>
            <td>{formatearCOP(fila.valorCentavos)}</td>
            {filas.some((f) => f.patron) ? <td>{fila.patron ?? '—'}</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
