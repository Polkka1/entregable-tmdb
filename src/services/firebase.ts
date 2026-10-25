// Inicialización de Firebase. Solo los servicios importan `auth` y `db`.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../config/env';

if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.projectId) {
  throw new Error('Faltan las variables EXPO_PUBLIC_FIREBASE_* en el archivo .env (ver .env.example).');
}

// Fast Refresh vuelve a ejecutar este módulo: se reutiliza la app si ya existe.
const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);

function crearAuth(): Auth {
  try {
    // AsyncStorage guarda la sesión: sigue activa al cerrar y reabrir la app (RF1).
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // initializeAuth falla si ya se llamó antes (Fast Refresh); en ese caso se reutiliza.
    return getAuth(app);
  }
}

export const auth = crearAuth();
export const db = getFirestore(app);
