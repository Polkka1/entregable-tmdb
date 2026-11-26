import { describe, expect, it } from 'vitest';
import type { EstadoVisto } from '../types/lista';
import { local, obra } from './fabricaDePrueba';
import { anioDeVista, cambioVistaEn, mesDeVista, obrasSinFecha } from './vistaEn';

describe('zona horaria de los tests', () => {
  it('es America/Guayaquil (UTC−5), para que D3 no dependa de la máquina', () => {
    expect(new Date(local(2025, 12, 31, 23, 30)).toISOString()).toBe('2026-01-01T04:30:00.000Z');
  });
});

describe('D1 · cambioVistaEn', () => {
  const casos: [EstadoVisto, EstadoVisto, ReturnType<typeof cambioVistaEn>][] = [
    // CA-A.1.1: pasar a vista guarda la fecha
    ['por_ver', 'vista', 'asignar'],
    ['viendo', 'vista', 'asignar'],
    // CA-A.1.2: dejar de estar vista la borra
    ['vista', 'por_ver', 'borrar'],
    ['vista', 'viendo', 'borrar'],
    // CA-A.1.4: editar calificación o comentario de una obra vista no la cambia
    ['vista', 'vista', 'mantener'],
    // CA-A.1.5: sin pasar por vista, sigue en null
    ['viendo', 'viendo', 'mantener'],
    ['por_ver', 'por_ver', 'mantener'],
    ['por_ver', 'viendo', 'mantener'],
    ['viendo', 'por_ver', 'mantener'],
  ];

  it.each(casos)('de %s a %s → %s', (anterior, nuevo, esperado) => {
    expect(cambioVistaEn(anterior, nuevo)).toBe(esperado);
  });

  it('CA-A.1.3: vista → por ver → vista toma la fecha nueva (borrar y después asignar)', () => {
    expect([cambioVistaEn('vista', 'por_ver'), cambioVistaEn('por_ver', 'vista')]).toEqual(['borrar', 'asignar']);
  });
});

describe('D3 · año y mes en la hora local', () => {
  it('CA-A.2.1: el 31 de diciembre a las 23:30 hora local es 2025 y diciembre, aunque en UTC ya sea 2026', () => {
    const vistaEn = local(2025, 12, 31, 23, 30);
    expect(anioDeVista(vistaEn)).toBe(2025);
    expect(mesDeVista(vistaEn)).toBe(11);
  });

  it('el 1 de enero a las 00:00 hora local ya es 2026 y enero', () => {
    const vistaEn = local(2026, 1, 1, 0, 0);
    expect(anioDeVista(vistaEn)).toBe(2026);
    expect(mesDeVista(vistaEn)).toBe(0);
  });
});

describe('D2 y PA-1 · obrasSinFecha', () => {
  it('CA-A.4.1 y CA-A.5.4: incluye las obras en vista sin vistaEn', () => {
    const sinFecha = obra({ estado: 'vista', vistaEn: null });
    expect(obrasSinFecha([sinFecha])).toEqual([sinFecha]);
  });

  it('CA-A.4.2: no incluye las obras en vista que ya tienen fecha (la migración se hace una sola vez)', () => {
    expect(obrasSinFecha([obra({ estado: 'vista', vistaEn: local(2025, 6, 10) })])).toEqual([]);
  });

  it('CA-A.4.3: no incluye las obras en por ver ni en viendo', () => {
    expect(
      obrasSinFecha([obra({ estado: 'por_ver', vistaEn: null }), obra({ estado: 'viendo', vistaEn: null })]),
    ).toEqual([]);
  });

  it('conserva el orden de la lista', () => {
    const a = obra({ vistaEn: null });
    const b = obra({ vistaEn: null });
    expect(obrasSinFecha([a, obra(), b])).toEqual([a, b]);
  });
});
