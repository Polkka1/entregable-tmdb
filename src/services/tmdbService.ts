// Único punto de la app que habla con TMDB (API v3).
// Convierte las respuestas crudas de la API en los tipos de dominio de types/tmdb.ts.

import { TMDB_TOKEN } from '../config/env';
import type { TipoMedio } from '../types/lista';
import type {
  DetalleObra,
  MiembroElenco,
  PaginaResultados,
  ResultadoBusqueda,
  TmdbConfiguracion,
  TmdbDetallePelicula,
  TmdbDetalleSerie,
  TmdbMiembroElenco,
  TmdbPagina,
  TmdbResultadoMulti,
  TmdbResultadoPelicula,
  TmdbResultadoSerie,
  UsoImagen,
} from '../types/tmdb';
import { assertNever } from '../utils/assertNever';
import { extraerAnio, formatearDuracion } from '../utils/formato';
import { ErrorHttp, obtenerJson } from './http';

const URL_BASE = 'https://api.themoviedb.org/3';
const IDIOMA = 'es-ES';
const MAX_ELENCO = 15;

type ParamsConsulta = Record<string, string | number | boolean>;

// URLSearchParams no está completo en React Native, así que la consulta se arma a mano.
function construirConsulta(params: ParamsConsulta): string {
  return Object.entries(params)
    .map(([clave, valor]) => `${encodeURIComponent(clave)}=${encodeURIComponent(String(valor))}`)
    .join('&');
}

function peticionTmdb<T>(ruta: string, params: ParamsConsulta = {}, signal?: AbortSignal): Promise<T> {
  if (!TMDB_TOKEN) {
    return Promise.reject(
      new ErrorHttp('no_autorizado', null, 'Falta EXPO_PUBLIC_TMDB_TOKEN en el archivo .env.'),
    );
  }
  const url = `${URL_BASE}${ruta}?${construirConsulta({ language: IDIOMA, ...params })}`;
  return obtenerJson<T>(url, {
    signal,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  });
}

// ---------------------------------------------------------------------------
// Imágenes: URL = base_url + file_size + file_path. Las dos primeras partes vienen de /configuration.
// ---------------------------------------------------------------------------

interface ConfiguracionImagenes {
  baseUrl: string;
  tamanosPoster: string[];
  tamanosPerfil: string[];
}

// Valores publicados por TMDB; se usan hasta que /configuration responda (o si falla).
let configuracionImagenes: ConfiguracionImagenes = {
  baseUrl: 'https://image.tmdb.org/t/p/',
  tamanosPoster: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
  tamanosPerfil: ['w45', 'w185', 'h632', 'original'],
};

let cargaConfiguracion: Promise<void> | null = null;

/** Pide /configuration una sola vez por sesión. Nunca falla: si hay error se quedan los valores por defecto. */
function asegurarConfiguracion(): Promise<void> {
  cargaConfiguracion ??= peticionTmdb<TmdbConfiguracion>('/configuration')
    .then(({ images }) => {
      configuracionImagenes = {
        baseUrl: images.secure_base_url,
        tamanosPoster: images.poster_sizes,
        tamanosPerfil: images.profile_sizes,
      };
    })
    .catch(() => {
      cargaConfiguracion = null; // se reintenta en la siguiente petición
    });
  return cargaConfiguracion;
}

// Tamaño pequeño en listas y uno mayor en el detalle.
const TAMANO_POR_USO: Record<UsoImagen, { coleccion: 'poster' | 'perfil'; tamano: string }> = {
  lista: { coleccion: 'poster', tamano: 'w185' },
  detalle: { coleccion: 'poster', tamano: 'w500' },
  perfil: { coleccion: 'perfil', tamano: 'w185' },
};

export function construirUrlImagen(filePath: string | null, uso: UsoImagen): string | null {
  if (!filePath) return null;
  const { coleccion, tamano } = TAMANO_POR_USO[uso];
  const disponibles =
    coleccion === 'poster' ? configuracionImagenes.tamanosPoster : configuracionImagenes.tamanosPerfil;
  const fileSize = disponibles.includes(tamano) ? tamano : 'original';
  return `${configuracionImagenes.baseUrl}${fileSize}${filePath}`;
}

// ---------------------------------------------------------------------------
// Búsqueda
// ---------------------------------------------------------------------------

function esObra(r: TmdbResultadoMulti): r is TmdbResultadoPelicula | TmdbResultadoSerie {
  return r.media_type === 'movie' || r.media_type === 'tv';
}

function mapearResultado(r: TmdbResultadoPelicula | TmdbResultadoSerie): ResultadoBusqueda {
  switch (r.media_type) {
    case 'movie':
      return { id: r.id, tipo: 'movie', titulo: r.title, anio: extraerAnio(r.release_date), posterPath: r.poster_path };
    case 'tv':
      return { id: r.id, tipo: 'tv', titulo: r.name, anio: extraerAnio(r.first_air_date), posterPath: r.poster_path };
    default:
      return assertNever(r);
  }
}

/** Busca películas y series por título (búsqueda combinada; se descartan personas). */
export async function buscar(titulo: string, pagina = 1, signal?: AbortSignal): Promise<PaginaResultados> {
  const [respuesta] = await Promise.all([
    peticionTmdb<TmdbPagina<TmdbResultadoMulti>>(
      '/search/multi',
      { query: titulo, page: pagina, include_adult: false },
      signal,
    ),
    asegurarConfiguracion(),
  ]);
  return {
    resultados: respuesta.results.filter(esObra).map(mapearResultado),
    pagina: respuesta.page,
    totalPaginas: respuesta.total_pages,
    totalResultados: respuesta.total_results,
  };
}

// ---------------------------------------------------------------------------
// Detalle (con elenco en la misma petición: append_to_response=credits)
// ---------------------------------------------------------------------------

function mapearElenco(cast: TmdbMiembroElenco[] | undefined): MiembroElenco[] {
  return (cast ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .slice(0, MAX_ELENCO)
    .map((m) => ({ id: m.id, nombre: m.name, personaje: m.character || null, fotoPath: m.profile_path }));
}

function textoOpcional(texto: string | null | undefined): string | null {
  const limpio = texto?.trim();
  return limpio ? limpio : null;
}

function mapearPelicula(d: TmdbDetallePelicula): DetalleObra {
  return {
    id: d.id,
    tipo: 'movie',
    titulo: d.title,
    anio: extraerAnio(d.release_date),
    posterPath: d.poster_path,
    sinopsis: textoOpcional(d.overview),
    calificacion: d.vote_average,
    votos: d.vote_count,
    generos: d.genres.map((g) => g.name),
    infoAdicional: d.runtime ? formatearDuracion(d.runtime) : null,
    elenco: mapearElenco(d.credits?.cast),
  };
}

function mapearSerie(d: TmdbDetalleSerie): DetalleObra {
  const temporadas = d.number_of_seasons;
  return {
    id: d.id,
    tipo: 'tv',
    titulo: d.name,
    anio: extraerAnio(d.first_air_date),
    posterPath: d.poster_path,
    sinopsis: textoOpcional(d.overview),
    calificacion: d.vote_average,
    votos: d.vote_count,
    generos: d.genres.map((g) => g.name),
    infoAdicional: temporadas ? `${temporadas} ${temporadas === 1 ? 'temporada' : 'temporadas'}` : null,
    elenco: mapearElenco(d.credits?.cast),
  };
}

export async function obtenerDetalle(tipo: TipoMedio, id: number, signal?: AbortSignal): Promise<DetalleObra> {
  const params = { append_to_response: 'credits' };
  switch (tipo) {
    case 'movie': {
      const [detalle] = await Promise.all([
        peticionTmdb<TmdbDetallePelicula>(`/movie/${id}`, params, signal),
        asegurarConfiguracion(),
      ]);
      return mapearPelicula(detalle);
    }
    case 'tv': {
      const [detalle] = await Promise.all([
        peticionTmdb<TmdbDetalleSerie>(`/tv/${id}`, params, signal),
        asegurarConfiguracion(),
      ]);
      return mapearSerie(detalle);
    }
    default:
      return assertNever(tipo);
  }
}
