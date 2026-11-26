// Fecha de visionado (D1, D2, D3 y PA-1). Funciones puras: sin Firebase ni la fecha del sistema.
// Spec 01 §5.1.
import type { EstadoVisto, ItemLista } from '../types/lista';

export type CambioVistaEn = 'asignar' | 'borrar' | 'mantener';

/** D1: qué le pasa a vistaEn cuando el estado cambia de `anterior` a `nuevo`. */
export function cambioVistaEn(anterior: EstadoVisto, nuevo: EstadoVisto): CambioVistaEn {
  throw new Error(`Sin implementar (T-A03): ${anterior} → ${nuevo}`);
}

/** D3: año calendario de vistaEn en la hora local del teléfono. */
export function anioDeVista(vistaEn: number): number {
  throw new Error(`Sin implementar (T-A03): ${vistaEn}`);
}

/** D3 y D10: mes de vistaEn en la hora local (0 = enero). */
export function mesDeVista(vistaEn: number): number {
  throw new Error(`Sin implementar (T-A03): ${vistaEn}`);
}

/** D2 y PA-1: obras en vista que todavía no tienen fecha. */
export function obrasSinFecha(items: ItemLista[]): ItemLista[] {
  throw new Error(`Sin implementar (T-A03): ${items.length}`);
}
