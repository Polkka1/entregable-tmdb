import { useCallback, useEffect, useRef, useState } from 'react';
import { esCancelacion } from '../services/http';
import { buscar } from '../services/tmdbService';
import type { EstadoPeticion } from '../types/peticion';
import type { PaginaResultados, ResultadoBusqueda } from '../types/tmdb';
import { mensajeDeError } from '../utils/errores';
import { crearItemId } from '../utils/lista';
import { useDebounce } from './useDebounce';

const MIN_CARACTERES = 2;
const ESPERA_MS = 450;

/** Antes de escribir no hay petición: se agrega el estado 'inactivo' a los tres de EstadoPeticion. */
export type EstadoBusqueda = { tipo: 'inactivo' } | EstadoPeticion<PaginaResultados>;

type EstadoTerminado = Exclude<EstadoPeticion<PaginaResultados>, { tipo: 'cargando' }>;

// TMDB puede repetir una obra entre páginas; las claves de la lista deben ser únicas.
function unirSinDuplicados(actuales: ResultadoBusqueda[], nuevos: ResultadoBusqueda[]): ResultadoBusqueda[] {
  const vistos = new Set(actuales.map((r) => crearItemId(r.tipo, r.id)));
  return [...actuales, ...nuevos.filter((r) => !vistos.has(crearItemId(r.tipo, r.id)))];
}

/** Búsqueda en TMDB con espera entre teclas, cancelación de peticiones viejas y paginación. */
export function useBusqueda(texto: string) {
  const consulta = useDebounce(texto.trim(), ESPERA_MS);
  const [intento, setIntento] = useState(0);
  // Resultado y error de paginación se guardan junto a la clave de la búsqueda que los produjo;
  // si la clave ya no es la actual, se ignoran (así no hay que limpiarlos en un efecto).
  const clave = `${intento}|${consulta}`;
  const [resultado, setResultado] = useState<{ clave: string; estado: EstadoTerminado } | null>(null);
  const [errorPaginacion, setErrorPaginacion] = useState<{ clave: string; mensaje: string } | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);
  const claveActual = useRef(clave);

  useEffect(() => {
    claveActual.current = clave;
    if (consulta.length < MIN_CARACTERES) return;
    const controlador = new AbortController();
    buscar(consulta, 1, controlador.signal)
      .then((datos) => setResultado({ clave, estado: { tipo: 'exito', datos } }))
      .catch((error: unknown) => {
        if (!esCancelacion(error)) setResultado({ clave, estado: { tipo: 'error', mensaje: mensajeDeError(error) } });
      });
    return () => controlador.abort();
  }, [clave, consulta]);

  let estado: EstadoBusqueda;
  if (consulta.length < MIN_CARACTERES) estado = { tipo: 'inactivo' };
  else if (resultado?.clave === clave) estado = resultado.estado;
  else estado = { tipo: 'cargando' };

  const hayMas = estado.tipo === 'exito' && estado.datos.pagina < estado.datos.totalPaginas;
  const errorMas = errorPaginacion?.clave === clave ? errorPaginacion.mensaje : null;

  const cargarMas = useCallback(async () => {
    if (estado.tipo !== 'exito' || !hayMas || cargandoMas) return;
    const anterior = estado.datos;
    setCargandoMas(true);
    setErrorPaginacion(null);
    try {
      const siguiente = await buscar(consulta, anterior.pagina + 1);
      // Si el usuario cambió el texto mientras tanto, esta página ya no sirve.
      if (claveActual.current !== clave) return;
      setResultado({
        clave,
        estado: {
          tipo: 'exito',
          datos: { ...siguiente, resultados: unirSinDuplicados(anterior.resultados, siguiente.resultados) },
        },
      });
    } catch (error) {
      setErrorPaginacion({ clave, mensaje: mensajeDeError(error) });
    } finally {
      setCargandoMas(false);
    }
  }, [estado, hayMas, cargandoMas, consulta, clave]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  return {
    consulta,
    estado,
    hayMas,
    cargandoMas,
    errorMas,
    cargarMas,
    reintentar,
    minCaracteres: MIN_CARACTERES,
  };
}
