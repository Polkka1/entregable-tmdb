import { describe, expect, it } from 'vitest';
import { datosParaGuardar, datosVacios, obrasPorCompletar, tieneDatos } from './datosTmdb';
import { local, obra } from './fabricaDePrueba';

const diez = (prefijo: string) => Array.from({ length: 10 }, (_, i) => `${prefijo} ${i + 1}`);

describe('D5 · datosParaGuardar de una película', () => {
  it('CA-A.1.6: guarda géneros, duración y directores', () => {
    expect(
      datosParaGuardar('movie', {
        generos: ['Ciencia ficción', 'Aventura'],
        duracionMin: 166,
        directores: ['Denis Villeneuve'],
      }),
    ).toEqual({ generos: ['Ciencia ficción', 'Aventura'], duracionMin: 166, directores: ['Denis Villeneuve'] });
  });

  it('CA-A.1.8: sin duración en TMDB, duracionMin es null', () => {
    expect(datosParaGuardar('movie', { generos: [], duracionMin: null, directores: [] }).duracionMin).toBeNull();
  });

  it.each([0, -5, 1001, 90.5])('una duración de %s, que las reglas rechazarían, se guarda como null', (duracion) => {
    expect(datosParaGuardar('movie', { generos: [], duracionMin: duracion, directores: [] }).duracionMin).toBeNull();
  });

  it('acepta los límites 1 y 1000 minutos', () => {
    expect(datosParaGuardar('movie', { generos: [], duracionMin: 1, directores: [] }).duracionMin).toBe(1);
    expect(datosParaGuardar('movie', { generos: [], duracionMin: 1000, directores: [] }).duracionMin).toBe(1000);
  });

  it('CA-A.1.9 (PA-8): con más de 10 géneros o directores guarda los 10 primeros', () => {
    const datos = datosParaGuardar('movie', {
      generos: [...diez('Género'), 'Género 11', 'Género 12'],
      duracionMin: 100,
      directores: [...diez('Director'), 'Director 11'],
    });
    expect(datos.generos).toEqual(diez('Género'));
    expect(datos.directores).toEqual(diez('Director'));
  });

  it('quita repetidos y textos vacíos antes de cortar en 10', () => {
    const datos = datosParaGuardar('movie', {
      generos: ['Drama', 'Drama', '', '  ', 'Comedia'],
      duracionMin: 100,
      directores: ['Ana', 'Ana', 'Luis'],
    });
    expect(datos.generos).toEqual(['Drama', 'Comedia']);
    expect(datos.directores).toEqual(['Ana', 'Luis']);
  });
});

describe('D5 · datosParaGuardar de una serie', () => {
  it('CA-A.1.7: guarda los géneros, duracionMin null y directores vacía', () => {
    expect(datosParaGuardar('tv', { generos: ['Drama'], duracionMin: 45, directores: ['Alguien'] })).toEqual({
      generos: ['Drama'],
      duracionMin: null,
      directores: [],
    });
  });
});

describe('PA-2 y PA-3 · tieneDatos y datosVacios', () => {
  it('PA-2: una obra sin el campo generos (null) no tiene datos', () => {
    expect(tieneDatos(obra({ generos: null }))).toBe(false);
  });

  it('PA-2: una obra con generos vacía sí tiene datos (ya se consultó)', () => {
    expect(tieneDatos(obra({ generos: [] }))).toBe(true);
  });

  it('CA-A.4.9 (PA-3): una obra que TMDB ya no tiene se guarda con listas vacías y queda con datos', () => {
    expect(datosVacios()).toEqual({ generos: [], duracionMin: null, directores: [] });
    expect(tieneDatos(obra({ ...datosVacios() }))).toBe(true);
  });
});

describe('D6 · obrasPorCompletar', () => {
  const sinDatos2026 = obra({ generos: null, duracionMin: null, directores: null, vistaEn: local(2026, 5, 1) });

  it('CA-A.4.5: incluye las obras vistas del año elegido sin datos', () => {
    expect(obrasPorCompletar([sinDatos2026], 2026)).toEqual([sinDatos2026]);
  });

  it('CA-A.4.6: no incluye las obras sin datos vistas en otro año', () => {
    const sinDatos2025 = obra({ generos: null, vistaEn: local(2025, 5, 1) });
    expect(obrasPorCompletar([sinDatos2025], 2026)).toEqual([]);
  });

  it('no incluye las obras que ya tienen datos, ni las que no están vistas, ni las que no tienen fecha', () => {
    const items = [
      obra({ vistaEn: local(2026, 5, 1) }),
      obra({ estado: 'por_ver', generos: null, vistaEn: null }),
      obra({ estado: 'vista', generos: null, vistaEn: null }),
    ];
    expect(obrasPorCompletar(items, 2026)).toEqual([]);
  });

  it('conserva el orden de la lista (se completan de una en una)', () => {
    const otra = obra({ generos: null, vistaEn: local(2026, 1, 15) });
    expect(obrasPorCompletar([sinDatos2026, obra(), otra], 2026)).toEqual([sinDatos2026, otra]);
  });
});
