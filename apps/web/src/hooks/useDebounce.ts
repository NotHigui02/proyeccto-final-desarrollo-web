import { useEffect, useState } from 'react';

/** Retrasa la propagación de un valor (p. ej. filtros) para no saturar la API. */
export function useDebounce<T>(valor: T, demoraMs = 300): T {
  const [retrasado, setRetrasado] = useState(valor);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setRetrasado(valor);
    }, demoraMs);
    return () => {
      window.clearTimeout(temporizador);
    };
  }, [valor, demoraMs]);

  return retrasado;
}
