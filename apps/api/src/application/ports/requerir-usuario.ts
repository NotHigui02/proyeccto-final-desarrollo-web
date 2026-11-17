/** Hasta el spec de autenticación: en demo no hace nada; en pruebas puede lanzar 401. */
export interface RequerirUsuario {
  ejecutar(): Promise<void>;
}
