// Ayudas para los tests del dominio. No se usa en la app.
import type { ItemLista } from '../types/lista';

/** Milisegundos de una fecha en la hora local (en los tests, America/Guayaquil: UTC−5). Mes de 1 a 12. */
export function local(anio: number, mes: number, dia: number, hora = 12, minuto = 0): number {
  return new Date(anio, mes - 1, dia, hora, minuto).getTime();
}

let siguienteId = 1;

/** Una película vista el 10 de marzo de 2026, con datos de TMDB y sin calificar. `parcial` cambia lo que haga falta. */
export function obra(parcial: Partial<ItemLista> = {}): ItemLista {
  const n = siguienteId++;
  return {
    id: `movie_${n}`,
    tmdbId: n,
    tipo: 'movie',
    titulo: `Obra ${n}`,
    anio: '2020',
    posterPath: null,
    estado: 'vista',
    calificacionPersonal: null,
    comentario: '',
    vistaEn: local(2026, 3, 10),
    generos: ['Drama'],
    duracionMin: 100,
    directores: ['Directora X'],
    ...parcial,
  };
}

/** Una serie vista el 10 de marzo de 2026 (sin duración ni directores, como guarda D5). */
export function serie(parcial: Partial<ItemLista> = {}): ItemLista {
  return obra({ tipo: 'tv', duracionMin: null, directores: [], ...parcial });
}
