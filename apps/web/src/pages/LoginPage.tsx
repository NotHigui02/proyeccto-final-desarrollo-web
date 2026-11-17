import { useId, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { EstadoCarga } from '../components/ui/EstadoCarga';
import { useSesion } from '../context/sesion';
import { ErrorApi } from '../services/clienteApi';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { estado, iniciar } = useSesion();
  const navigate = useNavigate();
  const idTitulo = useId();
  const idCorreo = useId();
  const idContraseña = useId();
  const idError = useId();
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (estado.tipo === 'carga') {
    return <EstadoCarga mensaje="Comprobando sesión…" />;
  }

  if (estado.tipo === 'autenticado') {
    return <Navigate to="/" replace />;
  }

  async function manejarEnvio(evento: { preventDefault: () => void }) {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await iniciar(correo.trim(), contraseña);
      await navigate('/');
    } catch (err) {
      setError(
        err instanceof ErrorApi
          ? err.message
          : 'No se pudo iniciar sesión. Revisa correo y contraseña.',
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className={styles.pagina}>
      <title>Iniciar sesión · Gastos con gráficos</title>
      <section className={styles.panel} aria-labelledby={idTitulo}>
        <h1 id={idTitulo} className={styles.titulo}>
          Iniciar sesión
        </h1>
        <p className={styles.ayuda}>Usa tu correo y contraseña para continuar.</p>
        <form
          className={styles.formulario}
          onSubmit={(evento) => void manejarEnvio(evento)}
          noValidate
        >
          <div className={styles.campo}>
            <label htmlFor={idCorreo}>Correo</label>
            <input
              id={idCorreo}
              name="email"
              type="email"
              autoComplete="username"
              value={correo}
              onChange={(evento) => {
                setCorreo(evento.target.value);
              }}
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? idError : undefined}
            />
          </div>
          <div className={styles.campo}>
            <label htmlFor={idContraseña}>Contraseña</label>
            <input
              id={idContraseña}
              name="password"
              type="password"
              autoComplete="current-password"
              value={contraseña}
              onChange={(evento) => {
                setContraseña(evento.target.value);
              }}
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? idError : undefined}
            />
          </div>
          {error ? (
            <p id={idError} className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className={styles.boton} disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
