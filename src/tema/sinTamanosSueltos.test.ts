import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// DESIGN.md §2.2 y §7: el tamaño de letra sale de `tipografia` (`...tipografia.dato`), nunca de un
// número suelto (`fontSize: 32`) en pantallas o componentes.

const RAIZ = path.resolve(__dirname, '..', '..');
const CARPETAS = ['src/screens', 'src/components', 'src/navigation'].map((c) => path.join(RAIZ, c));
const PATRON_TAMANO_SUELTO = /\bfontSize\s*:\s*\d/g;

function listarArchivos(carpeta: string): string[] {
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) return listarArchivos(ruta);
    return entrada.name.endsWith('.tsx') || entrada.name.endsWith('.ts') ? [ruta] : [];
  });
}

function buscarTamanosSueltos(archivo: string): string[] {
  const relativo = path.relative(RAIZ, archivo).split(path.sep).join('/');
  return fs
    .readFileSync(archivo, 'utf8')
    .split(/\r?\n/)
    .flatMap((linea, indice) =>
      [...linea.matchAll(PATRON_TAMANO_SUELTO)].map(() => `${relativo}:${indice + 1} ${linea.trim()}`),
    );
}

describe('sin tamaños de letra sueltos', () => {
  it('ninguna pantalla ni componente escribe fontSize con un número', () => {
    const hallazgos = CARPETAS.flatMap(listarArchivos).flatMap(buscarTamanosSueltos);
    expect(hallazgos, `Usa los tokens de tipografia de src/tema/:\n${hallazgos.join('\n')}`).toEqual([]);
  });

  it('el patrón detecta un número y no un token', () => {
    expect('fontSize: 14'.match(PATRON_TAMANO_SUELTO)).not.toBeNull();
    expect('fontSize: tipografia.dato.fontSize'.match(PATRON_TAMANO_SUELTO)).toBeNull();
  });
});
