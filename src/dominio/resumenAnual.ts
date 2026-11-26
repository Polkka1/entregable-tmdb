// Resumen de Mi año en cine (D3, D4 y D6 a D11). Funciones puras: el año actual se recibe como
// parámetro y nunca se lee la fecha del sistema. Spec 01 §5.3.
import type { ItemLista } from '../types/lista';
import { tieneDatos } from './datosTmdb';
import { anioDeVista, mesDeVista, vistaEnElAnio } from './vistaEn';

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

/** PA-5 y PA-6: orden alfabético en español, sin distinguir tildes ni mayúsculas. */
function compararTexto(a: string, b: string): number {
  return a.localeCompare(b, 'es', { sensitivity: 'base' });
}

/** D4: años con al menos una obra vista, más el actual, del más reciente al más antiguo. */
export function aniosDisponibles(items: ItemLista[], anioActual: number): number[] {
  const anios = new Set<number>([anioActual]);
  for (const item of items) {
    if (item.estado === 'vista' && item.vistaEn !== null) anios.add(anioDeVista(item.vistaEn));
  }
  return [...anios].sort((a, b) => b - a);
}

/**
 * D7 y PA-4: minutos a horas con un decimal, redondeando al décimo más cercano.
 * Se divide entre 6 (minutos por décimo de hora) para no arrastrar el error de coma flotante
 * de minutos / 60 * 10 (2247 / 60 * 10 = 374,4999…).
 */
export function redondearHoras(minutos: number): number {
  return Math.round(minutos / 6) / 10;
}

/** Promedio de las calificaciones del grupo, o null si ninguna obra está calificada. */
function promedioCalificado(obras: ItemLista[]): number | null {
  const notas = obras.map((o) => o.calificacionPersonal).filter((n): n is number => n !== null);
  return notas.length === 0 ? null : notas.reduce((suma, n) => suma + n, 0) / notas.length;
}

/** D8 y D9: el grupo con más obras; empate por promedio de calificación y después alfabético. */
export function elegirTop(grupos: Map<string, ItemLista[]>): { nombre: string; obras: number } | null {
  const candidatos = [...grupos].map(([nombre, obras]) => ({
    nombre,
    obras: obras.length,
    promedio: promedioCalificado(obras),
  }));
  candidatos.sort((a, b) => {
    if (a.obras !== b.obras) return b.obras - a.obras;
    // Un grupo sin obras calificadas pierde contra cualquiera que las tenga.
    if (a.promedio !== b.promedio) {
      if (a.promedio === null) return 1;
      if (b.promedio === null) return -1;
      return b.promedio - a.promedio;
    }
    return compararTexto(a.nombre, b.nombre);
  });
  const ganador = candidatos[0];
  return ganador ? { nombre: ganador.nombre, obras: ganador.obras } : null;
}

/** Agrupa las obras por cada nombre que devuelve `nombres`; una obra cuenta una vez por nombre. */
function agrupar(obras: ItemLista[], nombres: (obra: ItemLista) => string[]): Map<string, ItemLista[]> {
  const grupos = new Map<string, ItemLista[]>();
  for (const obra of obras) {
    for (const nombre of new Set(nombres(obra))) {
      grupos.set(nombre, [...(grupos.get(nombre) ?? []), obra]);
    }
  }
  return grupos;
}

/** D10: el mes con más obras; con empate, el más reciente. null si no hay obras. */
function elegirMes(obrasPorMes: number[]): number | null {
  let mejor: number | null = null;
  obrasPorMes.forEach((cantidad, mes) => {
    if (cantidad > 0 && (mejor === null || cantidad >= obrasPorMes[mejor])) mejor = mes;
  });
  return mejor;
}

/** D11 y PA-6: mayor calificación; empate, vistaEn más reciente; empate, título alfabético. */
function elegirDestacada(obras: (ItemLista & { vistaEn: number })[]): ItemLista | null {
  const calificadas = obras.filter((o) => o.calificacionPersonal !== null);
  calificadas.sort(
    (a, b) =>
      (b.calificacionPersonal ?? 0) - (a.calificacionPersonal ?? 0) ||
      b.vistaEn - a.vistaEn ||
      compararTexto(a.titulo, b.titulo),
  );
  return calificadas[0] ?? null;
}

/** Resumen de las obras vistas en `anio`. */
export function resumenAnual(items: ItemLista[], anio: number): ResumenAnual {
  const delAnio = items.filter((item) => vistaEnElAnio(item, anio));
  const peliculas = delAnio.filter((o) => o.tipo === 'movie');
  // D6: las obras sin datos cuentan en el total, pero no en horas, género ni director.
  const conDatos = delAnio.filter(tieneDatos);
  const peliculasConDatos = conDatos.filter((o) => o.tipo === 'movie');

  const minutos = peliculasConDatos.reduce((suma, o) => suma + (o.duracionMin ?? 0), 0);

  const obrasPorMes = Array.from({ length: 12 }, () => 0);
  for (const obra of delAnio) obrasPorMes[mesDeVista(obra.vistaEn)] += 1;

  return {
    anio,
    totalObras: delAnio.length,
    peliculas: peliculas.length,
    series: delAnio.length - peliculas.length,
    horas: redondearHoras(minutos),
    peliculasSinDuracion: peliculasConDatos.filter((o) => o.duracionMin === null).length,
    obrasSinDatos: delAnio.length - conDatos.length,
    generoTop: elegirTop(agrupar(conDatos, (o) => o.generos ?? [])),
    directorTop: elegirTop(agrupar(peliculasConDatos, (o) => o.directores ?? [])),
    obrasPorMes,
    mesTop: elegirMes(obrasPorMes),
    destacada: elegirDestacada(delAnio),
  };
}
