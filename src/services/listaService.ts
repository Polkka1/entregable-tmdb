// Único punto de la app que habla con Firestore: CRUD de usuarios/{uid}/mi_lista/{itemId}.

import { FirebaseError } from 'firebase/app';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type FieldValue,
} from 'firebase/firestore';
import {
  ESTADOS,
  ESTADO_INICIAL,
  TIPOS,
  type CambiosEntrada,
  type EstadoVisto,
  type ItemLista,
  type NuevaEntrada,
  type TipoMedio,
} from '../types/lista';
import { ErrorApp, conTiempoMaximo } from '../utils/errores';
import { crearItemId, normalizarCambios } from '../utils/lista';
import { db } from './firebase';

/** Sin conexión, Firestore deja la escritura en espera indefinidamente: se corta a los 10 s. */
const TIEMPO_MAXIMO_MS = 10_000;
const MENSAJE_TIEMPO = 'No se pudo contactar al servidor. Revisa tu conexión e intenta de nuevo.';

/** Lo que se guarda en Firestore: el itemId es el id del documento, no un campo. */
type DocumentoItem = Omit<ItemLista, 'id'> & { agregadoEn: FieldValue; actualizadoEn: FieldValue };

const MENSAJE_ERROR_FIRESTORE: Record<string, string> = {
  'permission-denied': 'No tienes permiso para realizar esta acción.',
  unauthenticated: 'Tu sesión expiró. Inicia sesión de nuevo.',
  unavailable: 'No se pudo contactar al servidor. Revisa tu conexión.',
  'deadline-exceeded': MENSAJE_TIEMPO,
  'resource-exhausted': 'Se alcanzó el límite de uso de la base de datos. Intenta más tarde.',
  'not-found': 'Esta obra ya no está en tu lista.',
};

function traducirError(error: unknown): ErrorApp {
  if (error instanceof ErrorApp) return error;
  if (error instanceof FirebaseError) {
    return new ErrorApp(error.code, MENSAJE_ERROR_FIRESTORE[error.code] ?? 'No se pudo guardar el cambio.');
  }
  return new ErrorApp('desconocido', 'Ocurrió un error inesperado.');
}

async function ejecutar<T>(operacion: () => Promise<T>): Promise<T> {
  try {
    return await conTiempoMaximo(operacion(), TIEMPO_MAXIMO_MS, MENSAJE_TIEMPO);
  } catch (error) {
    throw traducirError(error);
  }
}

const coleccionLista = (uid: string) => collection(db, 'usuarios', uid, 'mi_lista');
const documentoItem = (uid: string, itemId: string) => doc(db, 'usuarios', uid, 'mi_lista', itemId);

// Los datos vienen del servidor como DocumentData (sin tipo): se validan antes de usarlos.
function esEstado(valor: unknown): valor is EstadoVisto {
  return typeof valor === 'string' && (ESTADOS as readonly string[]).includes(valor);
}

function esTipo(valor: unknown): valor is TipoMedio {
  return typeof valor === 'string' && (TIPOS as readonly string[]).includes(valor);
}

function aItemLista(id: string, d: DocumentData): ItemLista | null {
  if (!esTipo(d.tipo) || !esEstado(d.estado) || typeof d.tmdbId !== 'number') return null;
  return {
    id,
    tmdbId: d.tmdbId,
    tipo: d.tipo,
    titulo: typeof d.titulo === 'string' ? d.titulo : '',
    anio: typeof d.anio === 'string' ? d.anio : '',
    posterPath: typeof d.posterPath === 'string' ? d.posterPath : null,
    estado: d.estado,
    calificacionPersonal: typeof d.calificacionPersonal === 'number' ? d.calificacionPersonal : null,
    comentario: typeof d.comentario === 'string' ? d.comentario : '',
  };
}

/** Lista del usuario, de la más reciente a la más antigua. */
export function obtenerLista(uid: string): Promise<ItemLista[]> {
  return ejecutar(async () => {
    const instantanea = await getDocs(query(coleccionLista(uid), orderBy('agregadoEn', 'desc')));
    return instantanea.docs
      .map((d) => aItemLista(d.id, d.data()))
      .filter((item): item is ItemLista => item !== null);
  });
}

/** Crea la entrada con estado inicial. El itemId tipo_tmdbId impide guardar la misma obra dos veces (RF4). */
export function agregarItem(uid: string, entrada: NuevaEntrada): Promise<ItemLista> {
  return ejecutar(async () => {
    const id = crearItemId(entrada.tipo, entrada.tmdbId);
    const ref = documentoItem(uid, id);
    if ((await getDoc(ref)).exists()) {
      throw new ErrorApp('duplicado', 'Esta obra ya está en tu lista.');
    }
    const datos: Omit<ItemLista, 'id'> = {
      ...entrada,
      estado: ESTADO_INICIAL,
      calificacionPersonal: null,
      comentario: '',
    };
    const documento: DocumentoItem = { ...datos, agregadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() };
    await setDoc(ref, documento);
    return { ...datos, id };
  });
}

export function actualizarItem(uid: string, itemId: string, cambios: CambiosEntrada): Promise<CambiosEntrada> {
  return ejecutar(async () => {
    const normalizados = normalizarCambios(cambios);
    await updateDoc(documentoItem(uid, itemId), { ...normalizados, actualizadoEn: serverTimestamp() });
    return normalizados;
  });
}

export function eliminarItem(uid: string, itemId: string): Promise<void> {
  return ejecutar(() => deleteDoc(documentoItem(uid, itemId)));
}
