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
