import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCartelera } from '../context/CarteleraContext';
import { obrasPorCompletar } from '../dominio/datosTmdb';
import { aniosDisponibles, resumenAnual } from '../dominio/resumenAnual';
import { obrasSinFecha } from '../dominio/vistaEn';
import { usePeticion } from './usePeticion';

// Todo lo que necesita la pantalla Mi año en cine (spec 01 §6.3). Las reglas se calculan en
// src/dominio/; este hook solo decide cuándo migrar (D2) y completar (D6), y nunca sin conexión (D13).

/** Una promesa que no termina: mantiene "cargando" mientras la lista todavía no está lista. */
const esperar = () => new Promise<number>(() => undefined);

const claveIntento = (anio: number, itemId: string) => `${anio}|${itemId}`;

export function useResumenAnual(anio: number) {
  const { lista, cargando, sinConexion, migrarFechas, completarDatos } = useCartelera();
  // El año actual se lee aquí y no en el dominio (spec 01 §5).
  const [anioActual] = useState(() => new Date().getFullYear());

  // D2: con conexión, una vez por montaje (y de nuevo al recuperar la conexión). Es idempotente:
  // las obras que ya tienen fecha no se tocan.
  const migrar = useCallback(
    () => (cargando ? esperar() : sinConexion ? Promise.resolve(0) : migrarFechas()),
    [cargando, sinConexion, migrarFechas],
  );
  const { estado: preparacion, reintentar } = usePeticion(migrar);
  const preparada = preparacion.tipo === 'exito';

  // D6: se completan de una en una las obras del año elegido. Cada obra se intenta una vez por
  // montaje; las que fallan cuentan como "sin datos" y se reintentan en la próxima apertura (PA-3).
  const [intentadas, setIntentadas] = useState<ReadonlySet<string>>(() => new Set());
  const ocupado = useRef(false);

  const pendientes = useMemo(
    () =>
      sinConexion || !preparada
        ? []
        : obrasPorCompletar(lista, anio).filter((item) => !intentadas.has(claveIntento(anio, item.id))),
    [sinConexion, preparada, lista, anio, intentadas],
  );
  const hechas = useMemo(
    () => [...intentadas].filter((clave) => clave.startsWith(`${anio}|`)).length,
    [intentadas, anio],
  );

  useEffect(() => {
    const siguiente = pendientes[0];
    if (!siguiente || ocupado.current) return;
    ocupado.current = true;
    completarDatos(siguiente)
      .catch(() => undefined) // Un fallo no detiene a las demás (D6).
      .finally(() => {
        ocupado.current = false;
        // Al marcarla, pendientes cambia y el efecto sigue con la próxima. Si el usuario cambió de
        // año mientras tanto, la próxima ya es del año nuevo (PA-9).
        setIntentadas((previas) => new Set(previas).add(claveIntento(anio, siguiente.id)));
      });
  }, [pendientes, completarDatos, anio]);

  const progreso = pendientes.length > 0 ? { hechas, total: hechas + pendientes.length } : null;

  const resumen = useMemo(() => resumenAnual(lista, anio), [lista, anio]);
  const anios = useMemo(() => aniosDisponibles(lista, anioActual), [lista, anioActual]);
  // PA-1: sin conexión no se migran fechas; se avisa cuántas obras vistas quedan fuera.
  const sinFecha = useMemo(() => (sinConexion ? obrasSinFecha(lista).length : 0), [sinConexion, lista]);

  return { anioActual, anios, resumen, preparacion, reintentar, progreso, sinConexion, sinFecha };
}
