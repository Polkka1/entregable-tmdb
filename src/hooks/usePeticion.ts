import { useCallback, useEffect, useState } from 'react';
import { esCancelacion } from '../services/http';
import type { EstadoPeticion } from '../types/peticion';
import { mensajeDeError } from '../utils/errores';

type EstadoTerminado<T> = Exclude<EstadoPeticion<T>, { tipo: 'cargando' }>;

/**
 * Ejecuta una petición y expone su estado (cargando, error o éxito).
 * `cargar` debe venir memorizado con useCallback: la petición se repite cuando cambia.
 * Si el componente se desmonta o `cargar` cambia, la petición anterior se cancela.
 */
export function usePeticion<T>(cargar: (signal: AbortSignal) => Promise<T>) {
  const [intento, setIntento] = useState(0);
  // Cada resultado guarda qué petición lo produjo; si no coincide con la actual, se está cargando.
  const [resultado, setResultado] = useState<{
    cargar: typeof cargar;
    intento: number;
    estado: EstadoTerminado<T>;
  } | null>(null);

  useEffect(() => {
    const controlador = new AbortController();
    const terminar = (estado: EstadoTerminado<T>) => {
      if (!controlador.signal.aborted) setResultado({ cargar, intento, estado });
    };
    cargar(controlador.signal)
      .then((datos) => terminar({ tipo: 'exito', datos }))
      .catch((error: unknown) => {
        if (!esCancelacion(error)) terminar({ tipo: 'error', mensaje: mensajeDeError(error) });
      });
    return () => controlador.abort();
  }, [cargar, intento]);

  const estado: EstadoPeticion<T> =
    resultado && resultado.cargar === cargar && resultado.intento === intento
      ? resultado.estado
      : { tipo: 'cargando' };

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  return { estado, reintentar };
}
