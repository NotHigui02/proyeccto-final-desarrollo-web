import { formatearCOP, type GastoPorCategoria } from '@gastos/shared';
import { useMemo } from 'react';
import { useTamanoContenedor } from '../../hooks/useTamanoContenedor';
import { TablaDatosGrafico } from './TablaDatosGrafico';
import styles from './Graficos.module.css';

const PATRONES = ['líneas', 'puntos', 'rayas', 'cuadros', 'cruces', 'ondas'] as const;

function polarACartesiano(cx: number, cy: number, radio: number, angulo: number) {
  return {
    x: cx + radio * Math.cos(angulo),
    y: cy + radio * Math.sin(angulo),
  };
}

function arco(cx: number, cy: number, radio: number, inicio: number, fin: number): string {
  const start = polarACartesiano(cx, cy, radio, fin);
  const end = polarACartesiano(cx, cy, radio, inicio);
  const grande = fin - inicio > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radio} ${radio} 0 ${grande} 0 ${end.x} ${end.y} Z`;
}

export function GraficoTorta({ datos }: { datos: readonly GastoPorCategoria[] }) {
  const { ref, ancho } = useTamanoContenedor();
  const total = useMemo(() => datos.reduce((suma, item) => suma + item.gastoCentavos, 0), [datos]);
  const filas = useMemo(
    () =>
      datos.map((item, indice) => ({
        etiqueta: item.nombre,
        valorCentavos: item.gastoCentavos,
        patron: PATRONES[indice % PATRONES.length],
      })),
    [datos],
  );

  const etiqueta = `Gasto por categoría. Total ${formatearCOP(total)}.`;
  const idTabla = 'tabla-gasto-categoria';
  const soportaSvg = typeof document !== 'undefined' && 'createElementNS' in document;
  const tamano = Math.min(ancho, 360);
  const radio = tamano / 2 - 8;
  const cx = tamano / 2;
  const cy = tamano / 2;

  let angulo = -Math.PI / 2;
  const sectores =
    total === 0
      ? []
      : datos.map((item, indice) => {
          const porcion = (item.gastoCentavos / total) * Math.PI * 2;
          const inicio = angulo;
          const fin = angulo + porcion;
          angulo = fin;
          return {
            ...item,
            path: arco(cx, cy, radio, inicio, fin),
            patron: PATRONES[indice % PATRONES.length],
          };
        });

  return (
    <figure className={styles.figura} ref={ref}>
      <figcaption className={styles.titulo}>Gasto por categoría</figcaption>
      {soportaSvg ? (
        <svg
          role="img"
          aria-label={etiqueta}
          aria-describedby={idTabla}
          viewBox={`0 0 ${tamano} ${tamano}`}
          width="100%"
          height="auto"
        >
          <title>{etiqueta}</title>
          <defs>
            {sectores.map((sector, indice) => (
              <pattern
                key={sector.categoriaId}
                id={`patron-torta-${String(indice)}`}
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <rect width="8" height="8" fill={sector.color} opacity="0.85" />
                <path d="M0 8 L8 0" stroke="#111" strokeWidth="1" opacity="0.45" />
              </pattern>
            ))}
          </defs>
          {sectores.map((sector, indice) => (
            <path
              key={sector.categoriaId}
              d={sector.path}
              fill={`url(#patron-torta-${String(indice)})`}
            >
              <title>
                {sector.nombre}: {formatearCOP(sector.gastoCentavos)} ({sector.patron})
              </title>
            </path>
          ))}
        </svg>
      ) : null}
      <TablaDatosGrafico id={idTabla} titulo="Datos del gasto por categoría" filas={filas} />
    </figure>
  );
}
