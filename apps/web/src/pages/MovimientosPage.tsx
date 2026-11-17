import {
  formatearCOP,
  formatearFecha,
  tipoMovimientoSchema,
  type Categoria,
  type Movimiento,
  type MovimientoEntrada,
  type TipoMovimiento,
} from '@gastos/shared';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FormularioMovimiento } from '../components/forms/FormularioMovimiento';
import { BotonExportarCsv } from '../components/ui/BotonExportarCsv';
import { EstadoCarga } from '../components/ui/EstadoCarga';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { SelectorMes } from '../components/ui/SelectorMes';
import { useMes } from '../context/mes';
import { useDebounce } from '../hooks/useDebounce';
import {
  actualizarMovimiento,
  eliminarMovimiento,
  ErrorApi,
  listarCategorias,
  listarMovimientos,
} from '../services/clienteApi';
import styles from './MovimientosPage.module.css';

const LIMITE = 20;

export function MovimientosPage() {
  const { mes } = useMes();
  const [tipo, setTipo] = useState<TipoMovimiento | ''>('');
  const [categoriaId, setCategoriaId] = useState('');
  const tipoDebounced = useDebounce(tipo);
  const categoriaDebounced = useDebounce(categoriaId);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [items, setItems] = useState<Movimiento[]>([]);
  const [siguienteCursor, setSiguienteCursor] = useState<string | null>(null);
  const [estado, setEstado] = useState<'carga' | 'listo' | 'vacio' | 'error'>('carga');
  const [mensajeError, setMensajeError] = useState('No se pudieron cargar los movimientos');
  const [cargandoMas, setCargandoMas] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [editando, setEditando] = useState<Movimiento | null>(null);
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const tituloDialogoId = useId();

  const nombreCategoria = useCallback(
    (id: string) => categorias.find((categoria) => categoria.id === id)?.nombre ?? id,
    [categorias],
  );

  const cargarPrimeraPagina = useCallback(
    async (señal?: AbortSignal) => {
      setEstado('carga');
      try {
        const [cats, pagina] = await Promise.all([
          listarCategorias(señal),
          listarMovimientos(
            {
              mes,
              tipo: tipoDebounced === '' ? undefined : tipoDebounced,
              categoriaId: categoriaDebounced === '' ? undefined : categoriaDebounced,
            },
            { limite: LIMITE },
            señal,
          ),
        ]);
        if (señal?.aborted) return;
        setCategorias(cats);
        setItems(pagina.items);
        setSiguienteCursor(pagina.siguienteCursor);
        setEstado(pagina.items.length === 0 ? 'vacio' : 'listo');
      } catch (error) {
        if (señal?.aborted) return;
        setMensajeError(
          error instanceof Error ? error.message : 'No se pudieron cargar los movimientos',
        );
        setEstado('error');
      }
    },
    [mes, tipoDebounced, categoriaDebounced],
  );

  useEffect(() => {
    const controlador = new AbortController();
    void cargarPrimeraPagina(controlador.signal);
    return () => {
      controlador.abort();
    };
  }, [cargarPrimeraPagina]);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    if (editando) {
      if (!dialogo.open) dialogo.showModal();
    } else if (dialogo.open) {
      dialogo.close();
    }
  }, [editando]);

  async function cargarMas() {
    if (!siguienteCursor || cargandoMas) return;
    setCargandoMas(true);
    try {
      const pagina = await listarMovimientos(
        {
          mes,
          tipo: tipoDebounced === '' ? undefined : tipoDebounced,
          categoriaId: categoriaDebounced === '' ? undefined : categoriaDebounced,
        },
        { limite: LIMITE, cursor: siguienteCursor },
      );
      setItems((actuales) => [...actuales, ...pagina.items]);
      setSiguienteCursor(pagina.siguienteCursor);
    } catch (error) {
      setAviso(error instanceof Error ? error.message : 'No se pudo cargar más');
    } finally {
      setCargandoMas(false);
    }
  }

  async function manejarActualizar(entrada: MovimientoEntrada) {
    if (!editando) return;
    await actualizarMovimiento(editando.id, entrada);
    setAviso('Movimiento actualizado');
    setEditando(null);
    await cargarPrimeraPagina();
  }

  async function manejarBorrar(movimiento: Movimiento) {
    const confirma = window.confirm(
      `¿Borrar el ${movimiento.tipo} de ${formatearCOP(movimiento.montoCentavos)} del ${formatearFecha(movimiento.fecha)}? No se puede deshacer.`,
    );
    if (!confirma) return;
    try {
      await eliminarMovimiento(movimiento.id);
      setAviso('Movimiento eliminado');
      await cargarPrimeraPagina();
    } catch (error) {
      setAviso(error instanceof ErrorApi ? error.message : 'No se pudo eliminar');
    }
  }

  return (
    <>
      <title>Movimientos · Gastos con gráficos</title>
      <h1>Movimientos</h1>

      <p className={styles.aviso} aria-live="polite">
        {aviso ?? ''}
      </p>

      <BotonExportarCsv mes={mes} />

      <section className={styles.filtros} aria-label="Filtros de movimientos">
        <SelectorMes />
        <div className={styles.filtrosExtras}>
          <div className={styles.campo}>
            <label htmlFor="filtro-tipo">Tipo</label>
            <select
              id="filtro-tipo"
              value={tipo}
              onChange={(evento) => {
                const valor = evento.target.value;
                if (valor === '') {
                  setTipo('');
                  return;
                }
                const parseado = tipoMovimientoSchema.safeParse(valor);
                if (parseado.success) setTipo(parseado.data);
              }}
            >
              <option value="">Todos</option>
              <option value="ingreso">Ingresos</option>
              <option value="gasto">Gastos</option>
            </select>
          </div>
          <div className={styles.campo}>
            <label htmlFor="filtro-categoria">Categoría</label>
            <select
              id="filtro-categoria"
              value={categoriaId}
              onChange={(evento) => {
                setCategoriaId(evento.target.value);
              }}
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {estado === 'carga' ? <EstadoCarga mensaje="Cargando movimientos…" /> : null}
      {estado === 'error' ? (
        <EstadoError mensaje={mensajeError} onReintentar={() => void cargarPrimeraPagina()} />
      ) : null}
      {estado === 'vacio' ? (
        <EstadoVacio mensaje="No hay movimientos con estos filtros. Registra el primero." />
      ) : null}
      {estado === 'listo' ? (
        <>
          <div className={styles.tablaEnvoltorio}>
            <table className={styles.tabla} aria-label={`Lista de movimientos del mes ${mes}`}>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Categoría</th>
                  <th scope="col">Monto</th>
                  <th scope="col">Nota</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td>{formatearFecha(movimiento.fecha)}</td>
                    <td>{movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}</td>
                    <td>{nombreCategoria(movimiento.categoriaId)}</td>
                    <td
                      className={`${styles.monto} ${movimiento.tipo === 'ingreso' ? styles.ingreso : styles.gasto}`}
                    >
                      {formatearCOP(movimiento.montoCentavos)}
                    </td>
                    <td>{movimiento.nota ?? '—'}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditando(movimiento);
                          }}
                        >
                          Editar
                        </button>
                        <button type="button" onClick={() => void manejarBorrar(movimiento)}>
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {siguienteCursor ? (
            <button
              type="button"
              className={styles.cargarMas}
              disabled={cargandoMas}
              onClick={() => void cargarMas()}
            >
              {cargandoMas ? 'Cargando…' : 'Cargar más'}
            </button>
          ) : null}
        </>
      ) : null}

      <dialog
        ref={dialogoRef}
        className={styles.dialogo}
        aria-labelledby={tituloDialogoId}
        onClose={() => {
          setEditando(null);
        }}
      >
        {editando ? (
          <>
            <h2 id={tituloDialogoId}>Editar movimiento</h2>
            <FormularioMovimiento
              key={editando.id}
              categorias={categorias}
              valoresIniciales={{
                tipo: editando.tipo,
                montoCentavos: editando.montoCentavos,
                categoriaId: editando.categoriaId,
                nota: editando.nota,
                fecha: editando.fecha,
                comprobanteUrl: null,
              }}
              textoEnvio="Guardar cambios"
              onEnviar={manejarActualizar}
            />
            <button
              type="button"
              className={styles.cerrar}
              onClick={() => {
                setEditando(null);
              }}
            >
              Cancelar
            </button>
          </>
        ) : null}
      </dialog>
    </>
  );
}
