// Datos de TMDB que se guardan en cada obra (D5, D6, PA-2, PA-3 y PA-8). Spec 01 §5.2.
import type { DatosTmdb, ItemLista, TipoMedio } from '../types/lista';
import { vistaEnElAnio } from './vistaEn';

/** Las reglas de Firestore admiten como máximo 10 géneros y 10 directores (PRD §7.4). */
const MAX_ELEMENTOS = 10;
/** Las reglas admiten una duración entera de 1 a 1000 minutos. */
const DURACION_MIN = 1;
const DURACION_MAX = 1000;

/** Lo que llega del detalle de TMDB, antes de normalizarlo. */
export interface DetalleParaGuardar {
  generos: string[];
  duracionMin: number | null;
  directores: string[];
}

/** Sin vacíos ni repetidos, y solo los primeros 10 (PA-8). */
function limpiarLista(valores: string[]): string[] {
  const unicos = [...new Set(valores.map((v) => v.trim()).filter((v) => v.length > 0))];
  return unicos.slice(0, MAX_ELEMENTOS);
}

function duracionValida(minutos: number | null): number | null {
  if (minutos === null || !Number.isInteger(minutos)) return null;
  return minutos >= DURACION_MIN && minutos <= DURACION_MAX ? minutos : null;
}

/** D5 y PA-8: normaliza los datos de TMDB para guardarlos (máximo 10, sin repetidos; series sin duración ni directores). */
export function datosParaGuardar(tipo: TipoMedio, detalle: DetalleParaGuardar): DatosTmdb {
  const generos = limpiarLista(detalle.generos);
  if (tipo === 'tv') return { generos, duracionMin: null, directores: [] };
  return { generos, duracionMin: duracionValida(detalle.duracionMin), directores: limpiarLista(detalle.directores) };
}

/** PA-3: datos de una obra que TMDB ya no tiene (404), para no volver a consultarla. */
export function datosVacios(): DatosTmdb {
  return { generos: [], duracionMin: null, directores: [] };
}

/** PA-2: una obra tiene datos de TMDB si su campo generos existe. */
export function tieneDatos(item: ItemLista): boolean {
  return item.generos !== null;
}

/** D6: obras vistas en `anio` que no tienen datos de TMDB, en el orden de la lista. */
export function obrasPorCompletar(items: ItemLista[], anio: number): ItemLista[] {
  return items.filter((item) => vistaEnElAnio(item, anio) && !tieneDatos(item));
}
