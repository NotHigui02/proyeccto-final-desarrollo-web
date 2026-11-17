import {
  movimientoEntradaSchema,
  pesosACentavos,
  tipoMovimientoSchema,
  type Categoria,
  type MovimientoEntrada,
  type TipoMovimiento,
} from '@gastos/shared';
import { useId, useState } from 'react';
import { ErrorApi } from '../../services/clienteApi';
import styles from './FormularioMovimiento.module.css';

interface Props {
  categorias: Categoria[];
  valoresIniciales?: MovimientoEntrada;
  textoEnvio: string;
  onEnviar: (entrada: MovimientoEntrada) => Promise<void>;
}

function hoyUtc(): string {
  const ahora = new Date();
  const año = ahora.getUTCFullYear();
  const mes = String(ahora.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getUTCDate()).padStart(2, '0');
  return `${String(año)}-${mes}-${dia}`;
}

function centavosAPesosTexto(centavos: number): string {
  const pesos = Math.trunc(centavos / 100);
  const decimales = Math.abs(centavos % 100);
  if (decimales === 0) return String(pesos);
  return `${String(pesos)},${String(decimales).padStart(2, '0')}`;
}

export function FormularioMovimiento({
  categorias,
  valoresIniciales,
  textoEnvio,
  onEnviar,
}: Props) {
  const idMonto = useId();
  const idCategoria = useId();
  const idFecha = useId();
  const idNota = useId();
  const idError = useId();

  const [tipo, setTipo] = useState<TipoMovimiento>(valoresIniciales?.tipo ?? 'gasto');
  const [montoPesos, setMontoPesos] = useState(
    valoresIniciales ? centavosAPesosTexto(valoresIniciales.montoCentavos) : '',
  );
  const [categoriaId, setCategoriaId] = useState(valoresIniciales?.categoriaId ?? '');
  const [fecha, setFecha] = useState(valoresIniciales?.fecha ?? hoyUtc());
  const [nota, setNota] = useState(valoresIniciales?.nota ?? '');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  async function manejarEnvio(evento: { preventDefault: () => void }) {
    evento.preventDefault();
    setErrorGeneral(null);

    let montoCentavos: number;
    try {
      montoCentavos = pesosACentavos(montoPesos);
    } catch (error) {
      setErrores({
        montoCentavos:
          error instanceof Error ? error.message : 'El monto tiene un formato inválido',
      });
      return;
    }

    const resultado = movimientoEntradaSchema.safeParse({
      tipo,
      montoCentavos,
      categoriaId,
      nota: nota.trim() === '' ? null : nota.trim(),
      fecha,
      comprobanteUrl: null,
    });

    if (!resultado.success) {
      const porCampo: Record<string, string> = {};
      for (const issue of resultado.error.issues) {
        const campo = String(issue.path[0] ?? 'general');
        porCampo[campo] = issue.message;
      }
      setErrores(porCampo);
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      await onEnviar(resultado.data);
    } catch (error) {
      if (error instanceof ErrorApi && error.detalles.length > 0) {
        const porCampo: Record<string, string> = {};
        for (const detalle of error.detalles) {
          porCampo[detalle.campo] = detalle.mensaje;
        }
        setErrores(porCampo);
        setErrorGeneral(error.message);
      } else {
        setErrorGeneral(error instanceof Error ? error.message : 'No se pudo guardar');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className={styles.formulario} onSubmit={(evento) => void manejarEnvio(evento)} noValidate>
      <fieldset className={styles.tipos}>
        <legend>Tipo</legend>
        {tipoMovimientoSchema.options.map((opcion) => (
          <label key={opcion} className={styles.opcionTipo}>
            <input
              type="radio"
              name="tipo"
              value={opcion}
              checked={tipo === opcion}
              onChange={() => {
                setTipo(opcion);
              }}
            />
            {opcion === 'ingreso' ? 'Ingreso' : 'Gasto'}
          </label>
        ))}
        {errores.tipo ? (
          <p id={`${idError}-tipo`} className={styles.errorCampo} role="alert">
            {errores.tipo}
          </p>
        ) : null}
      </fieldset>

      <div className={styles.campo}>
        <label htmlFor={idMonto}>Monto (pesos)</label>
        <input
          id={idMonto}
          name="monto"
          inputMode="decimal"
          value={montoPesos}
          onChange={(evento) => {
            setMontoPesos(evento.target.value);
          }}
          required
          aria-invalid={errores.montoCentavos ? true : undefined}
          aria-describedby={errores.montoCentavos ? `${idError}-monto` : undefined}
        />
        {errores.montoCentavos ? (
          <p id={`${idError}-monto`} className={styles.errorCampo} role="alert">
            {errores.montoCentavos}
          </p>
        ) : null}
      </div>

      <div className={styles.campo}>
        <label htmlFor={idCategoria}>Categoría</label>
        <select
          id={idCategoria}
          name="categoriaId"
          value={categoriaId}
          onChange={(evento) => {
            setCategoriaId(evento.target.value);
          }}
          required
          aria-invalid={errores.categoriaId ? true : undefined}
          aria-describedby={errores.categoriaId ? `${idError}-categoria` : undefined}
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
        {errores.categoriaId ? (
          <p id={`${idError}-categoria`} className={styles.errorCampo} role="alert">
            {errores.categoriaId}
          </p>
        ) : null}
      </div>

      <div className={styles.campo}>
        <label htmlFor={idFecha}>Fecha</label>
        <input
          id={idFecha}
          name="fecha"
          type="date"
          value={fecha}
          onChange={(evento) => {
            setFecha(evento.target.value);
          }}
          required
          aria-invalid={errores.fecha ? true : undefined}
          aria-describedby={errores.fecha ? `${idError}-fecha` : undefined}
        />
        {errores.fecha ? (
          <p id={`${idError}-fecha`} className={styles.errorCampo} role="alert">
            {errores.fecha}
          </p>
        ) : null}
      </div>

      <div className={styles.campo}>
        <label htmlFor={idNota}>Nota (opcional)</label>
        <textarea
          id={idNota}
          name="nota"
          value={nota}
          onChange={(evento) => {
            setNota(evento.target.value);
          }}
          maxLength={200}
          aria-invalid={errores.nota ? true : undefined}
          aria-describedby={errores.nota ? `${idError}-nota` : undefined}
        />
        {errores.nota ? (
          <p id={`${idError}-nota`} className={styles.errorCampo} role="alert">
            {errores.nota}
          </p>
        ) : null}
      </div>

      {errorGeneral ? (
        <p className={styles.errorGeneral} role="alert">
          {errorGeneral}
        </p>
      ) : null}

      <button type="submit" className={styles.boton} disabled={enviando || categorias.length === 0}>
        {enviando ? 'Guardando…' : textoEnvio}
      </button>
    </form>
  );
}
