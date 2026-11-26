import { describe, expect, it } from 'vitest';
import { MAX_COMENTARIO, type CambiosEntrada } from '../types/lista';
import { crearItemId, normalizarCambios } from './lista';

// Reglas del Proyecto 3 (docs/prd/PRD.md): RF6 (solo se califica si el estado es vista,
// comentario de hasta 500 caracteres) y RF4 (itemId tipo_tmdbId, sin duplicados).

function cambios(parcial: Partial<CambiosEntrada>): CambiosEntrada {
  return { estado: 'vista', calificacionPersonal: 4, comentario: '', ...parcial };
}

describe('RF6 · normalizarCambios', () => {
  it('conserva la calificación cuando el estado es vista', () => {
    expect(normalizarCambios(cambios({ estado: 'vista', calificacionPersonal: 5 })).calificacionPersonal).toBe(5);
  });

  it.each(['por_ver', 'viendo'] as const)('borra la calificación cuando el estado es %s', (estado) => {
    expect(normalizarCambios(cambios({ estado, calificacionPersonal: 3 })).calificacionPersonal).toBeNull();
  });

  it('deja la calificación nula si la obra vista no está calificada', () => {
    expect(normalizarCambios(cambios({ calificacionPersonal: null })).calificacionPersonal).toBeNull();
  });

  it('no cambia el estado', () => {
    expect(normalizarCambios(cambios({ estado: 'viendo' })).estado).toBe('viendo');
  });

  it('quita los espacios al inicio y al final del comentario', () => {
    expect(normalizarCambios(cambios({ comentario: '  Muy buena  ' })).comentario).toBe('Muy buena');
  });

  it(`limita el comentario a ${MAX_COMENTARIO} caracteres`, () => {
    const largo = 'a'.repeat(MAX_COMENTARIO + 20);
    expect(normalizarCambios(cambios({ comentario: largo })).comentario).toHaveLength(MAX_COMENTARIO);
  });

  it(`acepta un comentario de exactamente ${MAX_COMENTARIO} caracteres`, () => {
    const justo = 'b'.repeat(MAX_COMENTARIO);
    expect(normalizarCambios(cambios({ comentario: justo })).comentario).toBe(justo);
  });
});

describe('RF4 · crearItemId', () => {
  it('combina tipo y tmdbId', () => {
    expect(crearItemId('movie', 550)).toBe('movie_550');
    expect(crearItemId('tv', 1399)).toBe('tv_1399');
  });

  it('distingue una película de una serie con el mismo id de TMDB', () => {
    expect(crearItemId('movie', 550)).not.toBe(crearItemId('tv', 550));
  });
});
