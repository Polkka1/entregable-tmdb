import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// DESIGN.md §2: ningún archivo fuera de src/tema/ escribe un color en hexadecimal.
// Los colores salen de los tokens de src/tema/tema.ts.

const RAIZ = path.resolve(__dirname, '..', '..');
const CARPETA_SRC = path.join(RAIZ, 'src');
const CARPETA_TEMA = path.join(CARPETA_SRC, 'tema');
const EXTENSIONES = new Set(['.ts', '.tsx']);
// #RGB, #RGBA, #RRGGBB y #RRGGBBAA. No confunde "&#123;" (entidades) ni nombres como "a#b".
const PATRON_COLOR_HEX = /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

function listarArchivos(carpeta: string): string[] {
  if (carpeta === CARPETA_TEMA) return [];
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) return listarArchivos(ruta);
    return EXTENSIONES.has(path.extname(entrada.name)) ? [ruta] : [];
  });
}

function buscarColoresFijos(archivo: string): string[] {
  const relativo = path.relative(RAIZ, archivo).split(path.sep).join('/');
  return fs
    .readFileSync(archivo, 'utf8')
    .split(/\r?\n/)
    .flatMap((linea, indice) =>
      [...linea.matchAll(PATRON_COLOR_HEX)].map((coincidencia) => `${relativo}:${indice + 1} ${coincidencia[0]}`),
    );
}

describe('sin colores fijos', () => {
  it('ningún archivo fuera de src/tema/ escribe un color hexadecimal', () => {
    const archivos = [...listarArchivos(CARPETA_SRC), path.join(RAIZ, 'App.tsx')];
    const hallazgos = archivos.flatMap(buscarColoresFijos);

    expect(hallazgos, `Usa los tokens de src/tema/ en lugar de estos colores:\n${hallazgos.join('\n')}`).toEqual([]);
  });

  it('el patrón detecta los formatos de color y no las entidades', () => {
    const encontrar = (texto: string) => [...texto.matchAll(PATRON_COLOR_HEX)].map((c) => c[0]);
    expect(encontrar("color: '#FFF'")).toEqual(['#FFF']);
    expect(encontrar("color: '#0f1115'")).toEqual(['#0f1115']);
    expect(encontrar("color: '#0F111580'")).toEqual(['#0F111580']);
    expect(encontrar('&#123; y a#bcd')).toEqual([]);
  });
});
