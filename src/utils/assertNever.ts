/**
 * Se usa en el `default` de un switch sobre una unión. Si algún caso queda sin cubrir,
 * `valor` no es `never` y TypeScript marca error al compilar.
 */
export function assertNever(valor: never): never {
  throw new Error(`Caso no contemplado: ${JSON.stringify(valor)}`);
}
