import type { TipoMedio } from './lista';

// ---------------------------------------------------------------------------
// Respuestas crudas de la API v3 de TMDB (solo los campos que usa la app).
// Solo services/tmdbService.ts las conoce; las pantallas usan los tipos de dominio de abajo.
// ---------------------------------------------------------------------------

export interface TmdbPagina<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface TmdbResultadoObraBase {
  id: number;
  poster_path: string | null;
}

export interface TmdbResultadoPelicula extends TmdbResultadoObraBase {
  media_type: 'movie';
  title: string;
  release_date?: string;
}

export interface TmdbResultadoSerie extends TmdbResultadoObraBase {
  media_type: 'tv';
  name: string;
  first_air_date?: string;
}

export interface TmdbResultadoPersona {
  media_type: 'person';
  id: number;
  name: string;
}

/** /search/multi mezcla películas, series y personas; se distinguen por media_type. */
export type TmdbResultadoMulti = TmdbResultadoPelicula | TmdbResultadoSerie | TmdbResultadoPersona;

export interface TmdbMiembroElenco {
  id: number;
  name: string;
  character: string | null;
  profile_path: string | null;
  order: number;
}

interface TmdbDetalleBase {
  id: number;
  poster_path: string | null;
  overview: string | null;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  /** Llega en la misma petición gracias a append_to_response=credits */
  credits?: { cast: TmdbMiembroElenco[] };
}

export interface TmdbDetallePelicula extends TmdbDetalleBase {
  title: string;
  release_date?: string;
  runtime: number | null;
}

export interface TmdbDetalleSerie extends TmdbDetalleBase {
  name: string;
  first_air_date?: string;
  number_of_seasons?: number;
}

export interface TmdbConfiguracion {
  images: {
    secure_base_url: string;
    poster_sizes: string[];
    profile_sizes: string[];
  };
}

// ---------------------------------------------------------------------------
// Tipos de dominio que consumen las pantallas.
// ---------------------------------------------------------------------------

export interface ResultadoBusqueda {
  id: number;
  tipo: TipoMedio;
  titulo: string;
  /** Año de estreno o primera emisión; '' si TMDB no lo tiene */
  anio: string;
  posterPath: string | null;
}

export interface PaginaResultados {
  resultados: ResultadoBusqueda[];
  pagina: number;
  totalPaginas: number;
  totalResultados: number;
}

export interface MiembroElenco {
  id: number;
  nombre: string;
  personaje: string | null;
  fotoPath: string | null;
}

export interface DetalleObra {
  id: number;
  tipo: TipoMedio;
  titulo: string;
  anio: string;
  posterPath: string | null;
  /** null cuando TMDB no tiene sinopsis en el idioma pedido */
  sinopsis: string | null;
  /** Promedio de TMDB (0 a 10) */
  calificacion: number;
  votos: number;
  generos: string[];
  /** Duración de la película o número de temporadas de la serie */
  infoAdicional: string | null;
  elenco: MiembroElenco[];
}

/** Dónde se va a mostrar una imagen; define el tamaño que se pide a TMDB. */
export type UsoImagen = 'lista' | 'detalle' | 'perfil';
