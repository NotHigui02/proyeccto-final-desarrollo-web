/** Normaliza el nombre para unicidad (sin distinguir mayúsculas ni espacios extremos). */
export function normalizarNombreCategoria(nombre: string): string {
  return nombre.trim().toLocaleLowerCase('es');
}
