/** Datos de la sesión que usa la app (independientes del tipo User de Firebase). */
export interface Usuario {
  uid: string;
  email: string | null;
}
