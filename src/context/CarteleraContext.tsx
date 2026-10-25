import { addNetworkStateListener, useNetworkState } from 'expo-network';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { guardarCopiaLista, leerCopiaLista } from '../services/cacheService';
import { actualizarItem, agregarItem, eliminarItem, obtenerLista } from '../services/listaService';
import type { CambiosEntrada, ItemLista, NuevaEntrada } from '../types/lista';
import type { Usuario } from '../types/usuario';
import { ErrorApp } from '../utils/errores';
import { crearItemId } from '../utils/lista';

// Estado global de la lista personal del usuario con sesión.
//
// - Al montarse muestra primero la copia de AsyncStorage y luego la reemplaza con la de Firestore.
// - Cada mutación escribe en Firestore y, si el servidor la confirma, actualiza el estado local;
//   la copia en AsyncStorage se guarda cada vez que la lista cambia y coincide con el servidor.
// - Sin conexión se muestra la última copia con un aviso y no se permiten cambios (RF8).
//
// Se monta con key={usuario.uid}: al cambiar de cuenta el estado empieza de cero.

interface CarteleraContextValor {
  usuario: Usuario;
  lista: ItemLista[];
  /** true hasta tener la copia local o la respuesta del servidor */
  cargando: boolean;
  /** true si no hay internet o la última sincronización falló: se muestra la última copia */
  sinConexion: boolean;
  refrescar: () => Promise<void>;
  obtenerItem: (itemId: string) => ItemLista | undefined;
  /** Crea la entrada con estado inicial 'por_ver'. Si la obra ya está en la lista, no la duplica. */
  agregar: (entrada: NuevaEntrada) => Promise<void>;
  actualizar: (itemId: string, cambios: CambiosEntrada) => Promise<void>;
  eliminar: (itemId: string) => Promise<void>;
}

const CarteleraContext = createContext<CarteleraContextValor | null>(null);

export function CarteleraProvider({ usuario, children }: { usuario: Usuario; children: ReactNode }) {
  const { uid } = usuario;
  const [lista, setLista] = useState<ItemLista[]>([]);
  const [cargando, setCargando] = useState(true);
  /** true cuando `lista` refleja lo que hay en Firestore */
  const [sincronizada, setSincronizada] = useState(false);

  const red = useNetworkState();
  // Mientras el estado de la red es desconocido (undefined) se asume que hay conexión.
  const enLinea = red.isConnected !== false && red.isInternetReachable !== false;

  const sincronizar = useCallback(async () => {
    try {
      const items = await obtenerLista(uid);
      setLista(items);
      setSincronizada(true);
    } catch {
      setSincronizada(false);
    }
  }, [uid]);

  // Carga inicial: primero la copia local (inmediata), después el servidor.
  useEffect(() => {
    let activo = true;
    (async () => {
      const copia = await leerCopiaLista(uid);
      if (activo && copia) {
        setLista(copia);
        setCargando(false);
      }
      await sincronizar();
      if (activo) setCargando(false);
    })();
    return () => {
      activo = false;
    };
  }, [uid, sincronizar]);

  // Al recuperar la conexión, se vuelve a pedir la lista si la última vez falló.
  useEffect(() => {
    if (sincronizada) return;
    const suscripcion = addNetworkStateListener(({ isConnected, isInternetReachable }) => {
      if (isConnected !== false && isInternetReachable !== false) sincronizar();
    });
    return () => suscripcion.remove();
  }, [sincronizada, sincronizar]);

  // Mantiene la copia de AsyncStorage al día con la última versión confirmada por el servidor.
  useEffect(() => {
    if (sincronizada) guardarCopiaLista(uid, lista).catch(() => undefined);
  }, [uid, lista, sincronizada]);

  const sinConexion = !enLinea || (!sincronizada && !cargando);

  const exigirConexion = useCallback(() => {
    if (!enLinea) {
      throw new ErrorApp('sin_conexion', 'Sin conexión: podrás modificar tu lista cuando vuelvas a tener internet.');
    }
  }, [enLinea]);

  const obtenerItem = useCallback((itemId: string) => lista.find((i) => i.id === itemId), [lista]);

  const agregar = useCallback(
    async (entrada: NuevaEntrada) => {
      exigirConexion();
      const id = crearItemId(entrada.tipo, entrada.tmdbId);
      if (lista.some((i) => i.id === id)) return;
      const nuevo = await agregarItem(uid, entrada);
      setLista((actual) => (actual.some((i) => i.id === id) ? actual : [nuevo, ...actual]));
    },
    [exigirConexion, lista, uid],
  );

  const actualizar = useCallback(
    async (itemId: string, cambios: CambiosEntrada) => {
      exigirConexion();
      const guardados = await actualizarItem(uid, itemId, cambios);
      setLista((actual) => actual.map((i) => (i.id === itemId ? { ...i, ...guardados } : i)));
    },
    [exigirConexion, uid],
  );

  const eliminar = useCallback(
    async (itemId: string) => {
      exigirConexion();
      await eliminarItem(uid, itemId);
      setLista((actual) => actual.filter((i) => i.id !== itemId));
    },
    [exigirConexion, uid],
  );

  const valor = useMemo(
    () => ({
      usuario,
      lista,
      cargando,
      sinConexion,
      refrescar: sincronizar,
      obtenerItem,
      agregar,
      actualizar,
      eliminar,
    }),
    [usuario, lista, cargando, sinConexion, sincronizar, obtenerItem, agregar, actualizar, eliminar],
  );

  return <CarteleraContext.Provider value={valor}>{children}</CarteleraContext.Provider>;
}

export function useCartelera(): CarteleraContextValor {
  const contexto = useContext(CarteleraContext);
  if (!contexto) throw new Error('useCartelera debe usarse dentro de <CarteleraProvider>');
  return contexto;
}
