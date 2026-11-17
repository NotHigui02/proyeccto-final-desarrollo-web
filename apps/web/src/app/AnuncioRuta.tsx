import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

/** Mueve el foco al inicio del contenido principal al cambiar de ruta y anuncia el título. */
export function AnuncioRuta() {
  const ubicacion = useLocation();
  const destinoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const titulo = document.title;
    const destino = destinoRef.current;
    if (destino) {
      destino.focus();
      destino.textContent = titulo;
    }
  }, [ubicacion.pathname, ubicacion.search]);

  return (
    <div
      ref={destinoRef}
      tabIndex={-1}
      aria-live="polite"
      style={{
        position: 'absolute',
        inlineSize: 1,
        blockSize: 1,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
      }}
    />
  );
}
