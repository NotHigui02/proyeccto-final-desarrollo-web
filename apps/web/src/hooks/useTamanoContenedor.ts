import { useEffect, useRef, useState, type RefObject } from 'react';

const ANCHO_FIJO = 320;

export function useTamanoContenedor(): {
  ref: RefObject<HTMLDivElement | null>;
  ancho: number;
  soportaResizeObserver: boolean;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const soportaResizeObserver = typeof ResizeObserver === 'function';
  const [ancho, setAncho] = useState(ANCHO_FIJO);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    if (!soportaResizeObserver) {
      setAncho(nodo.clientWidth || ANCHO_FIJO);
      return;
    }

    const observador = new ResizeObserver((entradas) => {
      const entrada = entradas[0];
      if (!entrada) return;
      setAncho(Math.max(1, Math.floor(entrada.contentRect.width)));
    });
    observador.observe(nodo);
    return () => {
      observador.disconnect();
    };
  }, [soportaResizeObserver]);

  return { ref, ancho, soportaResizeObserver };
}
