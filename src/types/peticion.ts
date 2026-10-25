// Estado de cualquier petición asíncrona. Al ser una unión discriminada por `tipo`,
// TypeScript solo deja leer `datos` cuando tipo === 'exito' y `mensaje` cuando tipo === 'error'.
export type EstadoPeticion<T> =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'exito'; datos: T };
