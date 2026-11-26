// Resumen de Mi año en cine (D3, D4 y D6 a D11). Funciones puras: el año actual se recibe como
// parámetro y nunca se lee la fecha del sistema. Spec 01 §5.3.
import type { ItemLista } from '../types/lista';

export interface ResumenAnual {
  anio: number;
  totalObras: number;
  peliculas: number;
  series: number;
  /** Con un decimal (D7, PA-4) */
  horas: number;
  peliculasSinDuracion: number;
  /** D6 */
  obrasSinDatos: number;
  generoTop: { nombre: string; obras: number } | null;
  directorTop: { nombre: string; obras: number } | null;
  /** 12 posiciones, enero = 0 (D10) */
  obrasPorMes: number[];
  mesTop: number | null;
  /** D11 */
  destacada: ItemLista | null;
}

/** D4: años con al menos una obra vista, más el actual, del más reciente al más antiguo. */
export function aniosDisponibles(items: ItemLista[], anioActual: number): number[] {
  throw new Error(`Sin implementar (T-A03): ${items.length} ${anioActual}`);
}

/** D7 y PA-4: minutos a horas con un decimal, redondeando al décimo más cercano. */
export function redondearHoras(minutos: number): number {
  throw new Error(`Sin implementar (T-A03): ${minutos}`);
}

/** D8 y D9: el grupo con más obras; empate por promedio de calificación y después alfabético. */
export function elegirTop(grupos: Map<string, ItemLista[]>): { nombre: string; obras: number } | null {
  throw new Error(`Sin implementar (T-A03): ${grupos.size}`);
}

/** Resumen de las obras vistas en `anio`. */
export function resumenAnual(items: ItemLista[], anio: number): ResumenAnual {
  throw new Error(`Sin implementar (T-A03): ${items.length} ${anio}`);
}
