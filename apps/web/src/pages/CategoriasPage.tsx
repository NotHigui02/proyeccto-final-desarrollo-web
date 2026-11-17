import type { Categoria, CategoriaEntrada } from '@gastos/shared';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FormularioCategoria } from '../components/forms/FormularioCategoria';
import { EstadoCarga } from '../components/ui/EstadoCarga';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  ErrorApi,
  listarCategorias,
} from '../services/clienteApi';
import styles from './CategoriasPage.module.css';

export function CategoriasPage() {
  const [items, setItems] = useState<Categoria[]>([]);
  const [estado, setEstado] = useState<'carga' | 'listo' | 'vacio' | 'error'>('carga');
  const [mensajeError, setMensajeError] = useState('No se pudieron cargar las categorías');
  const [aviso, setAviso] = useState<string | null>(null);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const tituloDialogoId = useId();

  const cargar = useCallback(async () => {
    setEstado('carga');
    try {
      const datos = await listarCategorias();
      setItems(datos);
      setEstado(datos.length === 0 ? 'vacio' : 'listo');
    } catch (error) {
      setMensajeError(
        error instanceof Error ? error.message : 'No se pudieron cargar las categorías',
      );
      setEstado('error');
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    if (editando) {
      if (!dialogo.open) dialogo.showModal();
    } else if (dialogo.open) {
      dialogo.close();
    }
  }, [editando]);

  async function manejarCrear(entrada: CategoriaEntrada) {
    await crearCategoria(entrada);
    setAviso(`Categoría «${entrada.nombre}» creada`);
    await cargar();
  }

  async function manejarActualizar(entrada: CategoriaEntrada) {
    if (!editando) return;
    await actualizarCategoria(editando.id, entrada);
    setAviso(`Categoría «${entrada.nombre}» actualizada`);
    setEditando(null);
    await cargar();
  }

  async function manejarBorrar(categoria: Categoria) {
    const confirma = window.confirm(
      `¿Borrar la categoría «${categoria.nombre}»? No se puede deshacer.`,
    );
    if (!confirma) return;
    try {
      await eliminarCategoria(categoria.id);
      setAviso(`Categoría «${categoria.nombre}» eliminada`);
      await cargar();
    } catch (error) {
      setAviso(error instanceof ErrorApi ? error.message : 'No se pudo eliminar');
    }
  }

  return (
    <>
      <title>Categorías · Gastos con gráficos</title>
      <h1>Categorías</h1>

      <p className={styles.aviso} aria-live="polite">
        {aviso ?? ''}
      </p>

      <section className={styles.seccion} aria-labelledby="titulo-nueva">
        <h2 id="titulo-nueva">Nueva categoría</h2>
        <FormularioCategoria textoEnvio="Crear categoría" onEnviar={manejarCrear} />
      </section>

      <section className={styles.seccion} aria-labelledby="titulo-lista">
        <h2 id="titulo-lista">Tus categorías</h2>
        {estado === 'carga' ? <EstadoCarga mensaje="Cargando categorías…" /> : null}
        {estado === 'error' ? (
          <EstadoError mensaje={mensajeError} onReintentar={() => void cargar()} />
        ) : null}
        {estado === 'vacio' ? (
          <EstadoVacio mensaje="Todavía no tienes categorías. Crea la primera." />
        ) : null}
        {estado === 'listo' ? (
          <ul className={styles.lista}>
            {items.map((categoria) => (
              <li key={categoria.id} className={styles.item}>
                <span
                  className={styles.muestra}
                  style={{ backgroundColor: categoria.color }}
                  aria-hidden="true"
                />
                <div>
                  <p className={styles.nombre}>{categoria.nombre}</p>
                  <p className={styles.meta}>{categoria.color}</p>
                </div>
                <div className={styles.acciones}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditando(categoria);
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" onClick={() => void manejarBorrar(categoria)}>
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

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
            <h2 id={tituloDialogoId}>Editar categoría</h2>
            <FormularioCategoria
              key={editando.id}
              valoresIniciales={{ nombre: editando.nombre, color: editando.color }}
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
