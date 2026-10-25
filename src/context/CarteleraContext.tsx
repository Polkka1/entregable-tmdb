import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  ESTADO_INICIAL,
  type CambiosEntrada,
  type ItemLista,
  type NuevaEntrada,
} from '../types/lista';
import { crearItemId, normalizarCambios } from '../utils/lista';

// Estado global de la lista personal.
//
// Por ahora la lista vive solo en memoria. En el Paso 3 cada acción se conectará a
// services/listaService.ts (Firestore) y a la caché de AsyncStorage, y se agregará el usuario
// de Firebase Auth. Las acciones ya son asíncronas para que las pantallas no tengan que cambiar.

interface CarteleraContextValor {
  lista: ItemLista[];
  obtenerItem: (itemId: string) => ItemLista | undefined;
  /** Crea la entrada con estado inicial 'por_ver'. Si la obra ya está en la lista, no la duplica. */
  agregar: (entrada: NuevaEntrada) => Promise<void>;
  actualizar: (itemId: string, cambios: CambiosEntrada) => Promise<void>;
  eliminar: (itemId: string) => Promise<void>;
}

const CarteleraContext = createContext<CarteleraContextValor | null>(null);

export function CarteleraProvider({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<ItemLista[]>([]);

  const obtenerItem = useCallback((itemId: string) => lista.find((i) => i.id === itemId), [lista]);

  const agregar = useCallback(async (entrada: NuevaEntrada) => {
    const id = crearItemId(entrada.tipo, entrada.tmdbId);
    setLista((actual) => {
      if (actual.some((i) => i.id === id)) return actual;
      const nuevo: ItemLista = {
        ...entrada,
        id,
        estado: ESTADO_INICIAL,
        calificacionPersonal: null,
        comentario: '',
      };
      return [nuevo, ...actual];
    });
  }, []);

  const actualizar = useCallback(async (itemId: string, cambios: CambiosEntrada) => {
    const normalizados = normalizarCambios(cambios);
    setLista((actual) => actual.map((i) => (i.id === itemId ? { ...i, ...normalizados } : i)));
  }, []);

  const eliminar = useCallback(async (itemId: string) => {
    setLista((actual) => actual.filter((i) => i.id !== itemId));
  }, []);

  const valor = useMemo(
    () => ({ lista, obtenerItem, agregar, actualizar, eliminar }),
    [lista, obtenerItem, agregar, actualizar, eliminar],
  );

  return <CarteleraContext.Provider value={valor}>{children}</CarteleraContext.Provider>;
}

export function useCartelera(): CarteleraContextValor {
  const contexto = useContext(CarteleraContext);
  if (!contexto) throw new Error('useCartelera debe usarse dentro de <CarteleraProvider>');
  return contexto;
}
