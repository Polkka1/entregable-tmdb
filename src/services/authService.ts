// Único punto de la app que habla con Firebase Auth.

import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import type { Usuario } from '../types/usuario';
import { ErrorApp } from '../utils/errores';
import { auth } from './firebase';

// Errores de Firebase Auth traducidos (RF1). Los códigos no listados usan el mensaje genérico.
const MENSAJE_ERROR_AUTH: Record<string, string> = {
  'auth/invalid-email': 'El correo no tiene un formato válido.',
  'auth/missing-email': 'Ingresa tu correo.',
  'auth/missing-password': 'Ingresa tu contraseña.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
  'auth/network-request-failed': 'No hay conexión a internet. Revisa tu red e intenta de nuevo.',
  'auth/operation-not-allowed': 'El inicio de sesión con correo no está habilitado en Firebase.',
  'auth/invalid-api-key': 'La configuración de Firebase no es válida.',
};

function traducirErrorAuth(error: unknown): ErrorApp {
  if (error instanceof FirebaseError) {
    return new ErrorApp(error.code, MENSAJE_ERROR_AUTH[error.code] ?? 'No se pudo completar la operación. Intenta de nuevo.');
  }
  return new ErrorApp('desconocido', 'Ocurrió un error inesperado.');
}

/** Avisa cada vez que cambia la sesión (también al abrir la app). Devuelve la función para dejar de escuchar. */
export function observarSesion(alCambiar: (usuario: Usuario | null) => void): () => void {
  return onAuthStateChanged(auth, (u) => alCambiar(u ? { uid: u.uid, email: u.email } : null));
}

export async function iniciarSesion(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (error) {
    throw traducirErrorAuth(error);
  }
}

export async function registrarse(email: string, password: string): Promise<void> {
  try {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  } catch (error) {
    throw traducirErrorAuth(error);
  }
}

export async function cerrarSesion(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw traducirErrorAuth(error);
  }
}
