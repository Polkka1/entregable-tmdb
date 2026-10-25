// Cliente HTTP genérico: tiempo máximo, cancelación y errores traducidos al español.

export type CodigoErrorHttp =
  | 'sin_conexion'
  | 'tiempo_agotado'
  | 'cancelado'
  | 'no_autorizado'
  | 'no_encontrado'
  | 'limite_peticiones'
  | 'servidor'
  | 'desconocido';

const MENSAJE_ERROR: Record<CodigoErrorHttp, string> = {
  sin_conexion: 'No hay conexión a internet. Revisa tu red e intenta de nuevo.',
  tiempo_agotado: 'El servidor tardó demasiado en responder. Intenta de nuevo.',
  cancelado: 'La petición fue cancelada.',
  no_autorizado: 'El token de TMDB no es válido o no está configurado.',
  no_encontrado: 'No se encontró lo que buscabas.',
  limite_peticiones: 'Demasiadas peticiones seguidas. Espera unos segundos e intenta de nuevo.',
  servidor: 'El servicio no está disponible en este momento. Intenta más tarde.',
  desconocido: 'Ocurrió un error inesperado.',
};

export class ErrorHttp extends Error {
  readonly codigo: CodigoErrorHttp;
  readonly status: number | null;

  constructor(codigo: CodigoErrorHttp, status: number | null = null, mensaje = MENSAJE_ERROR[codigo]) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.codigo = codigo;
    this.status = status;
  }
}

function codigoPorStatus(status: number): CodigoErrorHttp {
  if (status === 401 || status === 403) return 'no_autorizado';
  if (status === 404) return 'no_encontrado';
  if (status === 429) return 'limite_peticiones';
  if (status >= 500) return 'servidor';
  return 'desconocido';
}

export interface OpcionesPeticion {
  headers?: Record<string, string>;
  /** Permite cancelar la petición desde fuera (por ejemplo, al cambiar el texto de búsqueda). */
  signal?: AbortSignal;
  timeoutMs?: number;
}

const TIMEOUT_POR_DEFECTO_MS = 10_000;

export async function obtenerJson<T>(
  url: string,
  { headers, signal, timeoutMs = TIMEOUT_POR_DEFECTO_MS }: OpcionesPeticion = {},
): Promise<T> {
  if (signal?.aborted) throw new ErrorHttp('cancelado');

  const controlador = new AbortController();
  let tiempoAgotado = false;
  const temporizador = setTimeout(() => {
    tiempoAgotado = true;
    controlador.abort();
  }, timeoutMs);
  const cancelarDesdeFuera = () => controlador.abort();
  signal?.addEventListener('abort', cancelarDesdeFuera);

  try {
    let respuesta: Response;
    try {
      respuesta = await fetch(url, { headers, signal: controlador.signal });
    } catch {
      if (tiempoAgotado) throw new ErrorHttp('tiempo_agotado');
      if (signal?.aborted) throw new ErrorHttp('cancelado');
      throw new ErrorHttp('sin_conexion');
    }

    if (!respuesta.ok) throw new ErrorHttp(codigoPorStatus(respuesta.status), respuesta.status);

    // json() devuelve any: aquí confiamos en el contrato documentado de la API
    // y lo convertimos al tipo que el llamador declara.
    const datos: unknown = await respuesta.json();
    return datos as T;
  } finally {
    clearTimeout(temporizador);
    signal?.removeEventListener('abort', cancelarDesdeFuera);
  }
}

export function esCancelacion(error: unknown): boolean {
  return error instanceof ErrorHttp && error.codigo === 'cancelado';
}

/** Convierte cualquier error en un mensaje apto para mostrar al usuario. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorHttp) return error.message;
  return MENSAJE_ERROR.desconocido;
}
