import type { Mes, Presupuesto, PresupuestoEntrada } from '@gastos/shared';

export interface RepositorioPresupuestos {
  obtener(uid: string, mes: Mes): Promise<Presupuesto | null>;
  guardar(uid: string, mes: Mes, entrada: PresupuestoEntrada): Promise<Presupuesto>;
}
