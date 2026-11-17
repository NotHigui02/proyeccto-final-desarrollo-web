import { estadoPresupuesto, formatearCOP, pesosACentavos, type Presupuesto } from '@gastos/shared';
import { useId, useState } from 'react';
import { ErrorApi, guardarPresupuesto } from '../../services/clienteApi';
import styles from './PresupuestoMes.module.css';

interface Props {
  mes: string;
  gastosCentavos: number;
  presupuesto: Presupuesto | null | undefined;
  onActualizado: () => void;
}

function centavosAPesosTexto(centavos: number): string {
  const pesos = Math.trunc(centavos / 100);
  const decimales = Math.abs(centavos % 100);
  if (decimales === 0) return String(pesos);
  return `${String(pesos)},${String(decimales).padStart(2, '0')}`;
}

export function PresupuestoMes({ mes, gastosCentavos, presupuesto, onActualizado }: Props) {
  const idMonto = useId();
  const idError = useId();
  const [montoPesos, setMontoPesos] = useState(
    presupuesto ? centavosAPesosTexto(presupuesto.montoCentavos) : '',
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estado = presupuesto ? estadoPresupuesto(gastosCentavos, presupuesto.montoCentavos) : null;

  async function manejarEnvio(evento: { preventDefault: () => void }) {
    evento.preventDefault();
    setError(null);
    let montoCentavos: number;
    try {
      montoCentavos = pesosACentavos(montoPesos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Monto inválido');
      return;
    }
    if (montoCentavos <= 0) {
      setError('El monto debe ser mayor que 0');
      return;
    }

    setEnviando(true);
    try {
      await guardarPresupuesto(mes, { montoCentavos });
      onActualizado();
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo guardar el presupuesto');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className={styles.bloque} aria-labelledby="titulo-presupuesto">
      <h2 id="titulo-presupuesto">Presupuesto del mes</h2>

      <form
        className={styles.formulario}
        onSubmit={(evento) => void manejarEnvio(evento)}
        noValidate
      >
        <div className={styles.campo}>
          <label htmlFor={idMonto}>Tope de gasto (pesos)</label>
          <input
            id={idMonto}
            name="presupuesto"
            inputMode="decimal"
            value={montoPesos}
            onChange={(evento) => {
              setMontoPesos(evento.target.value);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? idError : undefined}
            required
          />
          {error ? (
            <p id={idError} role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <button type="submit" className={styles.boton} disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar presupuesto'}
        </button>
      </form>

      {presupuesto && estado ? (
        <div className={styles.progreso}>
          <p>
            Gastado {formatearCOP(gastosCentavos)} de {formatearCOP(presupuesto.montoCentavos)} (
            {estado.porcentaje} %)
          </p>
          <progress
            className={styles.barra}
            max={100}
            value={Math.min(estado.porcentaje, 100)}
            aria-label={`Avance del presupuesto: ${String(estado.porcentaje)} por ciento`}
          />
          {estado.nivel === 'alerta' ? (
            <p className={styles.alerta} role="status" aria-live="polite">
              <span className={styles.icono} aria-hidden="true">
                !
              </span>
              Has alcanzado el 80 % de tu presupuesto mensual.
            </p>
          ) : null}
          {estado.nivel === 'excedido' ? (
            <p className={styles.excedido} role="status" aria-live="assertive">
              <span className={styles.icono} aria-hidden="true">
                !!
              </span>
              Has superado o agotado tu presupuesto mensual.
            </p>
          ) : null}
        </div>
      ) : (
        <p role="status">Aún no has definido un presupuesto para este mes.</p>
      )}
    </section>
  );
}
