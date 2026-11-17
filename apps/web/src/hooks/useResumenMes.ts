import { type Resumen } from '@gastos/shared';
import { useEffect, useState } from 'react';
import { ErrorApi, obtenerResumen } from '../services/clienteApi';

export type EstadoResumen =
  | { tipo: 'carga' }
  | { tipo: 'listo'; datos: Resumen }
  | { tipo: 'vacio'; datos: Resumen }
  | { tipo: 'error'; mensaje: string };

export function useResumenMes(mes: string): { estado: EstadoResumen; reintentar: () => void } {
  const [estado, setEstado] = useState<EstadoResumen>({ tipo: 'carga' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    setEstado({ tipo: 'carga' });

    void obtenerResumen(mes, controlador.signal)
      .then((datos) => {
        const vacio = datos.ingresosCentavos === 0 && datos.gastosCentavos === 0;
        setEstado(vacio ? { tipo: 'vacio', datos } : { tipo: 'listo', datos });
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return;
        const mensaje =
          error instanceof ErrorApi
            ? error.message
            : 'No se pudo cargar el resumen. Inténtalo de nuevo.';
        setEstado({ tipo: 'error', mensaje });
      });

    return () => {
      controlador.abort();
    };
  }, [mes, intento]);

  return {
    estado,
    reintentar: () => {
      setIntento((valor) => valor + 1);
    },
  };
}
