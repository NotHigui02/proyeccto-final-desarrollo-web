import type { Mes, Presupuesto, PresupuestoEntrada } from '@gastos/shared';
import type { Firestore } from 'firebase-admin/firestore';
import type { RepositorioPresupuestos } from '../../application/ports/repositorio-presupuestos.js';
import { coleccionPresupuestos } from './rutas-usuario.js';

export class RepositorioPresupuestosFirestore implements RepositorioPresupuestos {
  constructor(private readonly db: Firestore) {}

  async obtener(uid: string, mes: Mes): Promise<Presupuesto | null> {
    const doc = await coleccionPresupuestos(this.db, uid).doc(mes).get();
    if (!doc.exists) return null;
    const datos = doc.data() ?? {};
    return {
      mes,
      montoCentavos: Number(datos.montoCentavos),
    };
  }

  async guardar(uid: string, mes: Mes, entrada: PresupuestoEntrada): Promise<Presupuesto> {
    await coleccionPresupuestos(this.db, uid).doc(mes).set({
      montoCentavos: entrada.montoCentavos,
    });
    return { mes, montoCentavos: entrada.montoCentavos };
  }
}
