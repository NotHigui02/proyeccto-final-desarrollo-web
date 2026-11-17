import { formatearCOP } from './dinero.js';
import type { Categoria } from './categoria.js';
import type { Movimiento } from './movimiento.js';

const BOM_UTF8 = '\uFEFF';
const SEPARADOR = ';';

const CABECERAS = [
  'id',
  'fecha',
  'tipo',
  'categoria',
  'nota',
  'montoCentavos',
  'montoCOP',
] as const;

/**
 * Escapa una celda CSV: comillas, saltos de línea y prevención de inyección de fórmulas.
 */
export function escaparCeldaCsv(valor: string): string {
  let texto = valor;
  if (/^[=+\-@]/.test(texto)) {
    texto = `'${texto}`;
  }
  if (/["\n\r;]/.test(texto)) {
    return `"${texto.replaceAll('"', '""')}"`;
  }
  return texto;
}

/**
 * Genera CSV del mes con BOM UTF-8 y separador `;` (compatible con Excel en es-CO).
 */
export function generarCSV(
  movimientos: readonly Movimiento[],
  categorias: readonly Categoria[],
): string {
  const nombres = new Map(categorias.map((categoria) => [categoria.id, categoria.nombre]));
  const lineas = [CABECERAS.join(SEPARADOR)];

  for (const movimiento of movimientos) {
    const fila = [
      escaparCeldaCsv(movimiento.id),
      escaparCeldaCsv(movimiento.fecha),
      escaparCeldaCsv(movimiento.tipo),
      escaparCeldaCsv(nombres.get(movimiento.categoriaId) ?? movimiento.categoriaId),
      escaparCeldaCsv(movimiento.nota ?? ''),
      escaparCeldaCsv(String(movimiento.montoCentavos)),
      escaparCeldaCsv(formatearCOP(movimiento.montoCentavos)),
    ];
    lineas.push(fila.join(SEPARADOR));
  }

  return `${BOM_UTF8}${lineas.join('\n')}\n`;
}
