// Variables de entorno. Expo reemplaza process.env.EXPO_PUBLIC_* al compilar,
// así que deben leerse con acceso estático (no process.env[nombre]).
//
// Riesgo conocido: todo valor EXPO_PUBLIC_ queda visible dentro del paquete de la app.
// Se acepta para este proyecto no comercial; los valores viven en .env, que no se sube al repositorio.

export const TMDB_TOKEN: string = process.env.EXPO_PUBLIC_TMDB_TOKEN ?? '';

export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};
