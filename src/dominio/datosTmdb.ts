// Datos de TMDB que se guardan en cada obra (D5, D6, PA-2, PA-3 y PA-8). Spec 01 §5.2.
import type { DatosTmdb, ItemLista, TipoMedio } from '../types/lista';

/** Lo que llega del detalle de TMDB, antes de normalizarlo. */
export interface DetalleParaGuardar {
  generos: string[];
  duracionMin: number | null;
  directores: string[];
}

/** D5 y PA-8: normaliza los datos de TMDB para guardarlos (máximo 10, sin repetidos; series sin duración ni directores). */
export function datosParaGuardar(tipo: TipoMedio, detalle: DetalleParaGuardar): DatosTmdb {
  throw new Error(`Sin implementar (T-A03): ${tipo} ${detalle.generos.length}`);
}

/** PA-3: datos de una obra que TMDB ya no tiene (404), para no volver a consultarla. */
export function datosVacios(): DatosTmdb {
  throw new Error('Sin implementar (T-A03)');
}

/** PA-2: una obra tiene datos de TMDB si su campo generos existe. */
export function tieneDatos(item: ItemLista): boolean {
  throw new Error(`Sin implementar (T-A03): ${item.id}`);
}

/** D6: obras vistas en `anio` que no tienen datos de TMDB, en el orden de la lista. */
export function obrasPorCompletar(items: ItemLista[], anio: number): ItemLista[] {
  throw new Error(`Sin implementar (T-A03): ${items.length} ${anio}`);
}
