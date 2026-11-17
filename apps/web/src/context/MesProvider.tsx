import { mesAnterior, mesSchema, mesSiguiente, type Mes } from '@gastos/shared';
import { useCallback, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { MesContext, type MesContextValor } from './mes';

function mesActualDelSistema(): Mes {
  const ahora = new Date();
  const candidato = `${String(ahora.getFullYear())}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  return mesSchema.parse(candidato);
}

export function MesProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const parseado = mesSchema.safeParse(params.get('mes'));
  const mes = parseado.success ? parseado.data : mesActualDelSistema();

  const establecerMes = useCallback(
    (siguiente: Mes) => {
      const validado = mesSchema.parse(siguiente);
      setParams(
        (actuales) => {
          const nuevos = new URLSearchParams(actuales);
          nuevos.set('mes', validado);
          return nuevos;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const valor = useMemo<MesContextValor>(
    () => ({
      mes,
      establecerMes,
      irAlMesAnterior: () => {
        establecerMes(mesAnterior(mes));
      },
      irAlMesSiguiente: () => {
        establecerMes(mesSiguiente(mes));
      },
    }),
    [mes, establecerMes],
  );

  return <MesContext.Provider value={valor}>{children}</MesContext.Provider>;
}
