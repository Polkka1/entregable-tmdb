// Variables de entorno. Expo reemplaza process.env.EXPO_PUBLIC_* al compilar,
// así que deben leerse con acceso estático (no process.env[nombre]).
//
// Riesgo conocido: todo valor EXPO_PUBLIC_ queda visible dentro del paquete de la app.
// Se acepta para este proyecto no comercial; el token vive en .env, que no se sube al repositorio.

export const TMDB_TOKEN: string = process.env.EXPO_PUBLIC_TMDB_TOKEN ?? '';
