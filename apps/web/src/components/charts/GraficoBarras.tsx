import { formatearCOP, type PuntoEvolucion } from '@gastos/shared';
import { useMemo } from 'react';
import { useTamanoContenedor } from '../../hooks/useTamanoContenedor';
import { TablaDatosGrafico } from './TablaDatosGrafico';
import styles from './Graficos.module.css';

export function GraficoBarras({ datos }: { datos: readonly PuntoEvolucion[] }) {
  const { ref, ancho } = useTamanoContenedor();
  const filas = useMemo(
    () =>
      datos.flatMap((punto) => [
        {
          etiqueta: `${punto.mes} · ingresos`,
          valorCentavos: punto.ingresosCentavos,
          patron: 'relleno',
        },
        {
          etiqueta: `${punto.mes} · gastos`,
          valorCentavos: punto.gastosCentavos,
          patron: 'rayas',
        },
      ]),
    [datos],
  );

  const maximo = Math.max(
    1,
    ...datos.flatMap((punto) => [punto.ingresosCentavos, punto.gastosCentavos]),
  );
  const alto = 220;
  const margen = 32;
  const anchoUtil = Math.max(ancho, 280) - margen * 2;
  const grupo = anchoUtil / Math.max(datos.length, 1);
  const barra = Math.max(8, grupo / 3);
  const etiqueta = 'Evolución mensual de ingresos y gastos';
  const idTabla = 'tabla-evolucion-mensual';
  const soportaSvg = typeof document !== 'undefined' && 'createElementNS' in document;

  return (
    <figure className={styles.figura} ref={ref}>
      <figcaption className={styles.titulo}>Evolución mensual</figcaption>
      {soportaSvg ? (
        <svg
          role="img"
          aria-label={etiqueta}
          aria-describedby={idTabla}
          viewBox={`0 0 ${Math.max(ancho, 280)} ${alto + margen}`}
          width="100%"
          height="auto"
        >
          <title>{etiqueta}</title>
          <defs>
            <pattern id="patron-barras-gastos" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M0 6 L6 0" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          {datos.map((punto, indice) => {
            const x = margen + indice * grupo;
            const hIngreso = (punto.ingresosCentavos / maximo) * alto;
            const hGasto = (punto.gastosCentavos / maximo) * alto;
            return (
              <g key={punto.mes}>
                <rect
                  x={x}
                  y={margen + alto - hIngreso}
                  width={barra}
                  height={hIngreso}
                  fill="var(--color-primario)"
                >
                  <title>
                    {punto.mes} ingresos: {formatearCOP(punto.ingresosCentavos)}
                  </title>
                </rect>
                <rect
                  x={x + barra + 4}
                  y={margen + alto - hGasto}
                  width={barra}
                  height={hGasto}
                  fill="url(#patron-barras-gastos)"
                  stroke="currentColor"
                >
                  <title>
                    {punto.mes} gastos: {formatearCOP(punto.gastosCentavos)}
                  </title>
                </rect>
                <text x={x + barra} y={margen + alto + 14} textAnchor="middle" fontSize="10">
                  {punto.mes.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      ) : null}
      <TablaDatosGrafico id={idTabla} titulo="Datos de la evolución mensual" filas={filas} />
    </figure>
  );
}
