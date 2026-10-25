import { MAX_COMENTARIO, type CambiosEntrada, type TipoMedio } from '../types/lista';

/** TMDB maneja por separado los ids de películas y series: movie_550 ≠ tv_550. */
export function crearItemId(tipo: TipoMedio, tmdbId: number): string {
  return `${tipo}_${tmdbId}`;
}

/** Regla de negocio (RF6): solo se califica si el estado es 'vista'; comentario de hasta 500 caracteres. */
export function normalizarCambios(cambios: CambiosEntrada): CambiosEntrada {
  return {
    estado: cambios.estado,
    calificacionPersonal: cambios.estado === 'vista' ? cambios.calificacionPersonal : null,
    comentario: cambios.comentario.trim().slice(0, MAX_COMENTARIO),
  };
}
