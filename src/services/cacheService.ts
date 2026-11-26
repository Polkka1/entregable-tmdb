// Copia local de la lista en AsyncStorage para verla sin conexión (RF8). Una copia por usuario.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ItemLista } from '../types/lista';

interface CopiaLista {
  guardadoEn: number;
  items: ItemLista[];
}

const clave = (uid: string) => `cartelera:lista:${uid}`;

export async function guardarCopiaLista(uid: string, items: ItemLista[]): Promise<void> {
  const copia: CopiaLista = { guardadoEn: Date.now(), items };
  await AsyncStorage.setItem(clave(uid), JSON.stringify(copia));
}

/** Devuelve null si no hay copia o si está dañada. */
export async function leerCopiaLista(uid: string): Promise<ItemLista[] | null> {
  try {
    const texto = await AsyncStorage.getItem(clave(uid));
    if (!texto) return null;
    const copia: unknown = JSON.parse(texto);
    if (typeof copia !== 'object' || copia === null || !('items' in copia) || !Array.isArray(copia.items)) {
      return null;
    }
    // La copia la escribió esta misma app con guardarCopiaLista, así que se confía en su forma.
    // Una copia anterior a la épica Mi año en cine no trae los campos nuevos: quedan en null.
    return (copia.items as Partial<ItemLista>[]).map(
      (item) =>
        ({
          ...item,
          vistaEn: item.vistaEn ?? null,
          generos: item.generos ?? null,
          duracionMin: item.duracionMin ?? null,
          directores: item.directores ?? null,
        }) as ItemLista,
    );
  } catch {
    return null;
  }
}
