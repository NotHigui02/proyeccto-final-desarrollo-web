import { categoriaEntradaSchema, type CategoriaEntrada } from '@gastos/shared';
import { useId, useState } from 'react';
import styles from './FormularioCategoria.module.css';

interface Props {
  valoresIniciales?: CategoriaEntrada;
  textoEnvio: string;
  onEnviar: (entrada: CategoriaEntrada) => Promise<void>;
}

export function FormularioCategoria({ valoresIniciales, textoEnvio, onEnviar }: Props) {
  const idNombre = useId();
  const idColor = useId();
  const idError = useId();
  const [nombre, setNombre] = useState(valoresIniciales?.nombre ?? '');
  const [color, setColor] = useState(valoresIniciales?.color ?? '#0B5D4B');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  async function manejarEnvio(evento: { preventDefault: () => void }) {
    evento.preventDefault();
    setErrorGeneral(null);
    const resultado = categoriaEntradaSchema.safeParse({ nombre, color });
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
      setErrorGeneral(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className={styles.formulario} onSubmit={(evento) => void manejarEnvio(evento)} noValidate>
      <div className={styles.campo}>
        <label htmlFor={idNombre}>Nombre</label>
        <input
          id={idNombre}
          name="nombre"
          value={nombre}
          onChange={(evento) => {
            setNombre(evento.target.value);
          }}
          maxLength={40}
          required
          aria-invalid={errores.nombre ? true : undefined}
          aria-describedby={errores.nombre ? `${idError}-nombre` : undefined}
        />
        {errores.nombre ? (
          <p id={`${idError}-nombre`} className={styles.errorCampo} role="alert">
            {errores.nombre}
          </p>
        ) : null}
      </div>

      <div className={styles.campo}>
        <label htmlFor={idColor}>Color</label>
        <input
          id={idColor}
          name="color"
          type="color"
          value={color}
          onChange={(evento) => {
            setColor(evento.target.value.toUpperCase());
          }}
          required
          aria-invalid={errores.color ? true : undefined}
          aria-describedby={errores.color ? `${idError}-color` : undefined}
        />
        {errores.color ? (
          <p id={`${idError}-color`} className={styles.errorCampo} role="alert">
            {errores.color}
          </p>
        ) : null}
      </div>

      {errorGeneral ? (
        <p className={styles.errorGeneral} role="alert">
          {errorGeneral}
        </p>
      ) : null}

      <button type="submit" className={styles.boton} disabled={enviando}>
        {enviando ? 'Guardando…' : textoEnvio}
      </button>
    </form>
  );
}
