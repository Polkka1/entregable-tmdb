import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// DESIGN.md §2.4: ningún elemento de la app tiene bordes redondeados. Ninguna pantalla, componente
// ni navegador escribe borderRadius (ni sus variantes por esquina).

const RAIZ = path.resolve(__dirname, '..', '..');
const CARPETAS = ['src/screens', 'src/components', 'src/navigation'].map((c) => path.join(RAIZ, c));
const PATRON_RADIO = /\bborder(?:Top|Bottom|Start|End)?(?:Left|Right|Start|End)?Radius\b/g;

function listarArchivos(carpeta: string): string[] {
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) return listarArchivos(ruta);
    return entrada.name.endsWith('.tsx') || entrada.name.endsWith('.ts') ? [ruta] : [];
  });
}

function buscarRadios(archivo: string): string[] {
  const relativo = path.relative(RAIZ, archivo).split(path.sep).join('/');
  return fs
    .readFileSync(archivo, 'utf8')
    .split(/\r?\n/)
    .flatMap((linea, indice) =>
      [...linea.matchAll(PATRON_RADIO)].map(() => `${relativo}:${indice + 1} ${linea.trim()}`),
    );
}

describe('sin bordes redondeados', () => {
  it('ninguna pantalla ni componente escribe borderRadius', () => {
    const hallazgos = CARPETAS.flatMap(listarArchivos).flatMap(buscarRadios);
    expect(hallazgos, `DESIGN.md §2.4 pide esquinas rectas; quita estos radios:\n${hallazgos.join('\n')}`).toEqual([]);
  });

  it('el patrón detecta el radio general y los de cada esquina', () => {
    const encontrar = (texto: string) => [...texto.matchAll(PATRON_RADIO)].map((c) => c[0]);
    expect(encontrar('borderRadius: radio.md')).toEqual(['borderRadius']);
    expect(encontrar('borderTopLeftRadius: 4')).toEqual(['borderTopLeftRadius']);
    expect(encontrar('borderWidth: 1')).toEqual([]);
  });
});
