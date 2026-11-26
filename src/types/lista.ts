// Tipos del dominio "Mi lista" (modelo de datos de la sección 1.7).

export type EstadoVisto = 'por_ver' | 'viendo' | 'vista';
export type TipoMedio = 'movie' | 'tv';

export interface ItemLista {
  /** itemId = `${tipo}_${tmdbId}`, por ejemplo movie_550 o tv_1399 */
  id: string;
  tmdbId: number;
  tipo: TipoMedio;
  titulo: string;
  anio: string;
  /** Solo la ruta de TMDB; la URL completa se arma al mostrarla */
  posterPath: string | null;
  estado: EstadoVisto;
  /** De 1 a 5; solo si el estado es 'vista' */
  calificacionPersonal: number | null;
  comentario: string;
  // Campos de la épica Mi año en cine (PRD §7.4, spec 01 §4.2)
  /** Cuándo pasó a vista, en milisegundos desde 1970 (UTC). null si no está vista o si aún no se migró (D1, D2). */
  vistaEn: number | null;
  /** Géneros de TMDB en español. null = sin datos de TMDB: el campo no existe en Firestore (PA-2). */
  generos: string[] | null;
  /** Duración en minutos. null en series, sin dato o sin datos de TMDB (D5). */
  duracionMin: number | null;
  /** Directores de la película. [] en series; null = sin datos de TMDB (D5). */
  directores: string[] | null;
}

/** Datos de TMDB que se guardan al agregar o al completar una obra (D5, D6). */
export interface DatosTmdb {
  generos: string[];
  duracionMin: number | null;
  directores: string[];
}

/** Datos copiados de TMDB al agregar una obra a la lista. */
export type NuevaEntrada = Pick<ItemLista, 'tmdbId' | 'tipo' | 'titulo' | 'anio' | 'posterPath'>;

/** Campos que el usuario puede editar en su entrada. */
export type CambiosEntrada = Pick<ItemLista, 'estado' | 'calificacionPersonal' | 'comentario'>;

// Record obliga a cubrir TODOS los estados: si se agrega uno nuevo, TypeScript marca error
export const ETIQUETA_ESTADO: Record<EstadoVisto, string> = {
  por_ver: 'Por ver',
  viendo: 'Viendo',
  vista: 'Vista',
};

export const ETIQUETA_TIPO: Record<TipoMedio, string> = {
  movie: 'Película',
  tv: 'Serie',
};

export const ESTADOS: readonly EstadoVisto[] = ['por_ver', 'viendo', 'vista'];
export const TIPOS: readonly TipoMedio[] = ['movie', 'tv'];

export const ESTADO_INICIAL: EstadoVisto = 'por_ver';
export const MAX_COMENTARIO = 500;
export const CALIFICACION_MIN = 1;
export const CALIFICACION_MAX = 5;
