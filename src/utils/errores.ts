// Errores propios de la app: siempre llevan un mensaje en español apto para mostrar al usuario.

export class ErrorApp<C extends string = string> extends Error {
  readonly codigo: C;

  constructor(codigo: C, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorApp';
    this.codigo = codigo;
  }
}

const MENSAJE_GENERICO = 'Ocurrió un error inesperado.';

/** Convierte cualquier error en un mensaje apto para mostrar al usuario. */
export function mensajeDeError(error: unknown): string {
  return error instanceof ErrorApp ? error.message : MENSAJE_GENERICO;
}

/** Rechaza si `promesa` no termina a tiempo (por ejemplo, una escritura de Firestore sin conexión). */
export function conTiempoMaximo<T>(promesa: Promise<T>, ms: number, mensaje: string): Promise<T> {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, rechazar) => {
    temporizador = setTimeout(() => rechazar(new ErrorApp('tiempo_agotado', mensaje)), ms);
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(temporizador));
}
