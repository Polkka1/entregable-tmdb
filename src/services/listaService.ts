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
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type FieldValue,
} from 'firebase/firestore';
import {
  ESTADOS,
  ESTADO_INICIAL,
  TIPOS,
  type CambiosEntrada,
  type DatosTmdb,
  type EstadoVisto,
  type ItemLista,
  type NuevaEntrada,
  type TipoMedio,
} from '../types/lista';
import { ErrorApp, conTiempoMaximo } from '../utils/errores';
import { cambioVistaEn, obrasSinFecha, type CambioVistaEn } from '../dominio/vistaEn';
import { crearItemId, normalizarCambios } from '../utils/lista';
import { db } from './firebase';

/** Sin conexión, Firestore deja la escritura en espera indefinidamente: se corta a los 10 s. */
const TIEMPO_MAXIMO_MS = 10_000;
const MENSAJE_TIEMPO = 'No se pudo contactar al servidor. Revisa tu conexión e intenta de nuevo.';

/** Lo que se guarda en Firestore: el itemId es el id del documento, no un campo. */
/** Al crear, la obra está en por_ver: no lleva vistaEn (D1). Los datos de TMDB sí (D5). */
type DocumentoItem = Omit<ItemLista, 'id' | 'vistaEn' | keyof DatosTmdb> &
  DatosTmdb & { agregadoEn: FieldValue; actualizadoEn: FieldValue };

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

function esListaDeTexto(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every((v) => typeof v === 'string');
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
    vistaEn: d.vistaEn instanceof Timestamp ? d.vistaEn.toMillis() : null,
    // Un campo ausente significa "sin datos de TMDB" (PA-2).
    generos: esListaDeTexto(d.generos) ? d.generos : null,
    duracionMin: typeof d.duracionMin === 'number' ? d.duracionMin : null,
    directores: esListaDeTexto(d.directores) ? d.directores : null,
  };
}

/** Lista del usuario, de la más reciente a la más antigua. */
export function obtenerLista(uid: string): Promise<ItemLista[]> {
  return ejecutar(async () => {
    const instantanea = await getDocs(query(coleccionLista(uid), orderBy('agregadoEn', 'desc')));
    return instantanea.docs.map((d) => aItemLista(d.id, d.data())).filter((item): item is ItemLista => item !== null);
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
    const datos: Omit<DocumentoItem, 'agregadoEn' | 'actualizadoEn'> = {
      ...entrada,
      estado: ESTADO_INICIAL,
      calificacionPersonal: null,
      comentario: '',
    };
    const documento: DocumentoItem = { ...datos, agregadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() };
    await setDoc(ref, documento);
    return { ...datos, id, vistaEn: null };
  });
}

export interface ResultadoActualizacion {
  cambios: CambiosEntrada;
  /** D1: qué se hizo con vistaEn */
  vistaEn: CambioVistaEn;
}

/** Guarda los cambios de la entrada. D1: al pasar a vista guarda vistaEn con la hora del servidor; al salir, la borra. */
export function actualizarItem(
  uid: string,
  itemId: string,
  cambios: CambiosEntrada,
  estadoAnterior: EstadoVisto,
): Promise<ResultadoActualizacion> {
  return ejecutar(async () => {
    const normalizados = normalizarCambios(cambios);
    const vistaEn = cambioVistaEn(estadoAnterior, normalizados.estado);
    const campoVistaEn =
      vistaEn === 'asignar' ? { vistaEn: serverTimestamp() } : vistaEn === 'borrar' ? { vistaEn: null } : {};
    await updateDoc(documentoItem(uid, itemId), {
      ...normalizados,
      ...campoVistaEn,
      actualizadoEn: serverTimestamp(),
    });
    return { cambios: normalizados, vistaEn };
  });
}

export function eliminarItem(uid: string, itemId: string): Promise<void> {
  return ejecutar(() => deleteDoc(documentoItem(uid, itemId)));
}

/** Un lote de Firestore admite como máximo 500 escrituras. */
const MAX_ESCRITURAS_POR_LOTE = 500;

/**
 * D2: las obras en vista que no tienen vistaEn (anteriores a la épica) reciben vistaEn = actualizadoEn.
 * La escritura cambia actualizadoEn, como exigen las reglas (PA-7). Devuelve cuántas obras migró.
 */
export function migrarFechasVista(uid: string): Promise<number> {
  return ejecutar(async () => {
    const instantanea = await getDocs(query(coleccionLista(uid), where('estado', '==', 'vista')));
    const actualizadoEnPorId = new Map<string, Timestamp>();
    const items: ItemLista[] = [];
    for (const d of instantanea.docs) {
      const datos = d.data();
      const item = aItemLista(d.id, datos);
      if (item && datos.actualizadoEn instanceof Timestamp) {
        items.push(item);
        actualizadoEnPorId.set(d.id, datos.actualizadoEn);
      }
    }
    const porMigrar = obrasSinFecha(items);
    for (let inicio = 0; inicio < porMigrar.length; inicio += MAX_ESCRITURAS_POR_LOTE) {
      const lote = writeBatch(db);
      for (const item of porMigrar.slice(inicio, inicio + MAX_ESCRITURAS_POR_LOTE)) {
        lote.update(documentoItem(uid, item.id), {
          vistaEn: actualizadoEnPorId.get(item.id),
          actualizadoEn: serverTimestamp(),
        });
      }
      await lote.commit();
    }
    return porMigrar.length;
  });
}

/** D6: guarda los datos de TMDB de una obra que no los tenía. */
export function guardarDatosTmdb(uid: string, itemId: string, datos: DatosTmdb): Promise<void> {
  return ejecutar(() => updateDoc(documentoItem(uid, itemId), { ...datos, actualizadoEn: serverTimestamp() }));
}
