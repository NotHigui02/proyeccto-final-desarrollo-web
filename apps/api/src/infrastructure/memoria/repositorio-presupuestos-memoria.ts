import type { Mes, Presupuesto, PresupuestoEntrada } from '@gastos/shared';
import type { RepositorioPresupuestos } from '../../application/ports/repositorio-presupuestos.js';

export class RepositorioPresupuestosMemoria implements RepositorioPresupuestos {
  private readonly porUsuario = new Map<string, Map<string, Presupuesto>>();

  obtener(uid: string, mes: Mes): Promise<Presupuesto | null> {
    return Promise.resolve(this.mapaDe(uid).get(mes) ?? null);
  }

  guardar(uid: string, mes: Mes, entrada: PresupuestoEntrada): Promise<Presupuesto> {
    const presupuesto: Presupuesto = { mes, montoCentavos: entrada.montoCentavos };
    this.mapaDe(uid).set(mes, presupuesto);
    return Promise.resolve(presupuesto);
  }

  private mapaDe(uid: string): Map<string, Presupuesto> {
    let mapa = this.porUsuario.get(uid);
    if (!mapa) {
      mapa = new Map();
      this.porUsuario.set(uid, mapa);
    }
    return mapa;
  }
}
