import { useMemo } from 'react';
import { GraficoBarras } from '../components/charts/GraficoBarras';
import { GraficoTorta } from '../components/charts/GraficoTorta';
import { EstadoCarga } from '../components/ui/EstadoCarga';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { SelectorMes } from '../components/ui/SelectorMes';
import { TotalesMes } from '../components/ui/TotalesMes';
import { useMes } from '../context/mes';
import { useResumenMes } from '../hooks/useResumenMes';

export function InicioPage() {
  const { mes } = useMes();
  const { estado, reintentar } = useResumenMes(mes);
  const porCategoria = useMemo(
    () => (estado.tipo === 'listo' || estado.tipo === 'vacio' ? estado.datos.porCategoria : []),
    [estado],
  );

  return (
    <>
      <title>Resumen del mes · Gastos con gráficos</title>
      <h1>Resumen del mes</h1>
      <SelectorMes />

      {estado.tipo === 'carga' ? <EstadoCarga mensaje="Cargando resumen…" /> : null}
      {estado.tipo === 'error' ? (
        <EstadoError mensaje={estado.mensaje} onReintentar={reintentar} />
      ) : null}
      {estado.tipo === 'vacio' ? <EstadoVacio mensaje="No hay movimientos en este mes." /> : null}

      {estado.tipo === 'listo' ? (
        <>
          <TotalesMes
            ingresosCentavos={estado.datos.ingresosCentavos}
            gastosCentavos={estado.datos.gastosCentavos}
            saldoCentavos={estado.datos.saldoCentavos}
          />
          <GraficoTorta datos={porCategoria} />
          <GraficoBarras datos={estado.datos.evolucion} />
        </>
      ) : null}
    </>
  );
}
