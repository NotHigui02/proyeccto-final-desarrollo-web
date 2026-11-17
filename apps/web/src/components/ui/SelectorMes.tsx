import { mesSchema } from '@gastos/shared';
import { useMes } from '../../context/mes';
import styles from './SelectorMes.module.css';

export function SelectorMes() {
  const { mes, irAlMesAnterior, irAlMesSiguiente, establecerMes } = useMes();

  return (
    <div className={styles.contenedor}>
      <p className={styles.anuncio} aria-live="polite">
        Mes seleccionado: {mes}
      </p>
      <div className={styles.controles} role="group" aria-label="Seleccionar mes">
        <button type="button" className={styles.boton} onClick={irAlMesAnterior}>
          Mes anterior
        </button>
        <label className={styles.etiqueta}>
          Mes
          <input
            className={styles.entrada}
            type="month"
            value={mes}
            onChange={(evento) => {
              const resultado = mesSchema.safeParse(evento.target.value);
              if (resultado.success) establecerMes(resultado.data);
            }}
          />
        </label>
        <button type="button" className={styles.boton} onClick={irAlMesSiguiente}>
          Mes siguiente
        </button>
      </div>
    </div>
  );
}
