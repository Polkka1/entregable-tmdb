// Fecha de visionado (D1, D2, D3 y PA-1). Funciones puras: sin Firebase ni la fecha del sistema.
// Spec 01 §5.1.
import type { EstadoVisto, ItemLista } from '../types/lista';

export type CambioVistaEn = 'asignar' | 'borrar' | 'mantener';

/** D1: qué le pasa a vistaEn cuando el estado cambia de `anterior` a `nuevo`. */
export function cambioVistaEn(anterior: EstadoVisto, nuevo: EstadoVisto): CambioVistaEn {
  if (nuevo === 'vista' && anterior !== 'vista') return 'asignar';
  if (anterior === 'vista' && nuevo !== 'vista') return 'borrar';
  // Vista → vista (editar calificación o comentario) o un cambio que no pasa por vista.
  return 'mantener';
}

/** D3: año calendario de vistaEn en la hora local del teléfono. */
export function anioDeVista(vistaEn: number): number {
  return new Date(vistaEn).getFullYear();
}

/** D3 y D10: mes de vistaEn en la hora local (0 = enero). */
export function mesDeVista(vistaEn: number): number {
  return new Date(vistaEn).getMonth();
}

/** D2 y PA-1: obras en vista que todavía no tienen fecha. */
export function obrasSinFecha(items: ItemLista[]): ItemLista[] {
  return items.filter((item) => item.estado === 'vista' && item.vistaEn === null);
}

/** D3: la obra está vista y su fecha cae en `anio`. */
export function vistaEnElAnio(item: ItemLista, anio: number): item is ItemLista & { vistaEn: number } {
  return item.estado === 'vista' && item.vistaEn !== null && anioDeVista(item.vistaEn) === anio;
}
