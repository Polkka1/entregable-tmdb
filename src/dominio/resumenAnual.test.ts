import { describe, expect, it } from 'vitest';
import { local, obra, serie } from './fabricaDePrueba';
import { aniosDisponibles, elegirTop, redondearHoras, resumenAnual } from './resumenAnual';

const ANIO = 2026;

describe('D4 · aniosDisponibles', () => {
  it('CA-A.3.1: años con obras vistas, del más reciente al más antiguo y sin repetir', () => {
    const items = [
      obra({ vistaEn: local(2024, 2, 1) }),
      obra({ vistaEn: local(2026, 3, 1) }),
      obra({ vistaEn: local(2024, 8, 1) }),
    ];
    expect(aniosDisponibles(items, 2026)).toEqual([2026, 2024]);
  });

  it('CA-A.3.2: el año actual aparece aunque no tenga obras', () => {
    expect(aniosDisponibles([obra({ vistaEn: local(2023, 5, 5) })], 2026)).toEqual([2026, 2023]);
  });

  it('CA-A.3.3: sin obras vistas, solo el año actual', () => {
    expect(aniosDisponibles([], 2026)).toEqual([2026]);
  });

  it('CA-A.3.4: las obras en por ver, en viendo o sin fecha no agregan años', () => {
    const items = [
      obra({ estado: 'por_ver', vistaEn: null }),
      obra({ estado: 'viendo', vistaEn: null }),
      obra({ estado: 'vista', vistaEn: null }),
    ];
    expect(aniosDisponibles(items, 2026)).toEqual([2026]);
  });

  it('D3: una obra vista el 31 de diciembre a las 23:30 hora local agrega ese año', () => {
    expect(aniosDisponibles([obra({ vistaEn: local(2025, 12, 31, 23, 30) })], 2026)).toEqual([2026, 2025]);
  });

  it('un año con obras posterior al actual (reloj del teléfono atrasado) también aparece, ordenado', () => {
    expect(aniosDisponibles([obra({ vistaEn: local(2027, 1, 2) })], 2026)).toEqual([2027, 2026]);
  });
});

describe('D3 · qué obras cuentan en el año', () => {
  it('CA-A.2.1: el 31 de diciembre a las 23:30 hora local cuenta en 2025 y no en 2026', () => {
    const items = [obra({ vistaEn: local(2025, 12, 31, 23, 30) })];
    expect(resumenAnual(items, 2025).totalObras).toBe(1);
    expect(resumenAnual(items, 2026).totalObras).toBe(0);
  });

  it('CA-A.2.2: solo cuentan las obras vistas en el año; por ver, viendo y sin fecha no cuentan', () => {
    const items = [
      obra({ vistaEn: local(2026, 2, 1) }),
      obra({ vistaEn: local(2025, 2, 1) }),
      obra({ estado: 'por_ver', vistaEn: null }),
      obra({ estado: 'viendo', vistaEn: null }),
      obra({ estado: 'vista', vistaEn: null }),
    ];
    expect(resumenAnual(items, ANIO).totalObras).toBe(1);
  });

  it('devuelve el año pedido', () => {
    expect(resumenAnual([], 2024).anio).toBe(2024);
  });
});

describe('totales', () => {
  it('CA-A.2.3: 3 películas y 2 series dan 5 obras', () => {
    const r = resumenAnual([obra(), obra(), obra(), serie(), serie()], ANIO);
    expect([r.totalObras, r.peliculas, r.series]).toEqual([5, 3, 2]);
  });
});

describe('D7 · horas de cine', () => {
  it('CA-A.2.4: 120 + 95 + 2035 min = 37,5 h; las series no suman horas', () => {
    const items = [
      obra({ duracionMin: 120 }),
      obra({ duracionMin: 95 }),
      obra({ duracionMin: 2035 }),
      serie({ duracionMin: 45 }),
    ];
    expect(resumenAnual(items, ANIO).horas).toBe(37.5);
  });

  it.each([
    [2245, 37.4],
    [2247, 37.5],
    [2250, 37.5],
    [0, 0],
    [59, 1],
    [1, 0],
  ])('CA-A.2.5 (PA-4): %s min → %s h', (minutos, horas) => {
    expect(redondearHoras(minutos)).toBe(horas);
  });

  it('CA-A.2.6: una película con datos pero sin duración no suma y se cuenta en peliculasSinDuracion', () => {
    const r = resumenAnual([obra({ duracionMin: 120 }), obra({ duracionMin: null })], ANIO);
    expect(r.horas).toBe(2);
    expect(r.peliculasSinDuracion).toBe(1);
  });

  it('una serie no cuenta como película sin duración', () => {
    expect(resumenAnual([serie()], ANIO).peliculasSinDuracion).toBe(0);
  });
});

describe('D6 · obras sin datos', () => {
  it('CA-A.4.7: cuenta en el total, pero no en horas, género, director ni películas sin duración', () => {
    const sinDatos = obra({ generos: null, duracionMin: 300, directores: null });
    const r = resumenAnual([sinDatos, obra({ duracionMin: 60, generos: ['Comedia'], directores: ['Ana'] })], ANIO);
    expect(r.totalObras).toBe(2);
    expect(r.obrasSinDatos).toBe(1);
    expect(r.horas).toBe(1);
    expect(r.peliculasSinDuracion).toBe(0);
    expect(r.generoTop).toEqual({ nombre: 'Comedia', obras: 1 });
    expect(r.directorTop).toEqual({ nombre: 'Ana', obras: 1 });
  });

  it('una obra sin datos de otro año no cuenta', () => {
    expect(resumenAnual([obra({ generos: null, vistaEn: local(2025, 1, 1) })], ANIO).obrasSinDatos).toBe(0);
  });
});

describe('D8 · género más visto', () => {
  it('CA-A.2.7: cada obra suma 1 a cada uno de sus géneros; gana el que tiene más obras', () => {
    const items = [
      obra({ generos: ['Drama'] }),
      obra({ generos: ['Drama'] }),
      obra({ generos: ['Drama', 'Comedia'] }),
      serie({ generos: ['Comedia'] }),
    ];
    expect(resumenAnual(items, ANIO).generoTop).toEqual({ nombre: 'Drama', obras: 3 });
  });

  it('CA-A.2.8: con empate en obras gana el mayor promedio de calificación', () => {
    const items = [
      obra({ generos: ['Drama'], calificacionPersonal: 3 }),
      obra({ generos: ['Drama'], calificacionPersonal: 3 }),
      obra({ generos: ['Comedia'], calificacionPersonal: 4 }),
      obra({ generos: ['Comedia'], calificacionPersonal: 5 }),
    ];
    expect(resumenAnual(items, ANIO).generoTop).toEqual({ nombre: 'Comedia', obras: 2 });
  });

  it('el promedio solo considera las obras calificadas del género', () => {
    const items = [
      obra({ generos: ['Drama'], calificacionPersonal: 4 }),
      obra({ generos: ['Drama'], calificacionPersonal: null }),
      obra({ generos: ['Comedia'], calificacionPersonal: 3 }),
      obra({ generos: ['Comedia'], calificacionPersonal: 3 }),
    ];
    expect(resumenAnual(items, ANIO).generoTop?.nombre).toBe('Drama');
  });

  it('CA-A.2.9: un género sin obras calificadas pierde el empate', () => {
    const items = [
      obra({ generos: ['Drama'] }),
      obra({ generos: ['Drama'] }),
      obra({ generos: ['Comedia'], calificacionPersonal: 1 }),
      obra({ generos: ['Comedia'] }),
    ];
    expect(resumenAnual(items, ANIO).generoTop?.nombre).toBe('Comedia');
  });

  it('CA-A.2.10 (PA-5): con empate en obras y promedio gana el orden alfabético', () => {
    const items = [
      obra({ generos: ['Aventura'], calificacionPersonal: 4 }),
      obra({ generos: ['Acción'], calificacionPersonal: 4 }),
    ];
    expect(resumenAnual(items, ANIO).generoTop?.nombre).toBe('Acción');
  });

  it('PA-5: el orden alfabético no distingue tildes ni mayúsculas', () => {
    const items = [obra({ generos: ['Misterio'] }), obra({ generos: ['ánimas'] })];
    expect(resumenAnual(items, ANIO).generoTop?.nombre).toBe('ánimas');
  });

  it('un género repetido dentro de la misma obra suma una sola vez', () => {
    const items = [obra({ generos: ['Drama', 'Drama'] }), obra({ generos: ['Comedia'], calificacionPersonal: 5 })];
    expect(resumenAnual(items, ANIO).generoTop).toEqual({ nombre: 'Comedia', obras: 1 });
  });

  it('sin géneros, generoTop es null', () => {
    expect(resumenAnual([obra({ generos: [] })], ANIO).generoTop).toBeNull();
  });
});

describe('D9 · director más visto', () => {
  it('CA-A.2.11: solo cuentan las películas', () => {
    const items = [
      serie({ directores: ['Alguien de serie'] }),
      serie({ directores: ['Alguien de serie'] }),
      obra({ directores: ['Greta Gerwig'] }),
    ];
    expect(resumenAnual(items, ANIO).directorTop).toEqual({ nombre: 'Greta Gerwig', obras: 1 });
  });

  it('gana el director con más películas', () => {
    const items = [
      obra({ directores: ['Denis Villeneuve'] }),
      obra({ directores: ['Denis Villeneuve', 'Otra'] }),
      obra({ directores: ['Otra'] }),
      obra({ directores: ['Denis Villeneuve'] }),
    ];
    expect(resumenAnual(items, ANIO).directorTop).toEqual({ nombre: 'Denis Villeneuve', obras: 3 });
  });

  it('CA-A.2.12: con empate se desempata como en D8 (promedio y después alfabético)', () => {
    const porPromedio = [
      obra({ directores: ['Bong Joon-ho'], calificacionPersonal: 3 }),
      obra({ directores: ['Céline Sciamma'], calificacionPersonal: 5 }),
    ];
    expect(resumenAnual(porPromedio, ANIO).directorTop?.nombre).toBe('Céline Sciamma');

    const porNombre = [obra({ directores: ['Céline Sciamma'] }), obra({ directores: ['Bong Joon-ho'] })];
    expect(resumenAnual(porNombre, ANIO).directorTop?.nombre).toBe('Bong Joon-ho');
  });

  it('CA-A.2.13: si ninguna película tiene director, directorTop es null', () => {
    expect(resumenAnual([obra({ directores: [] }), serie()], ANIO).directorTop).toBeNull();
  });
});

describe('D10 · mes más activo', () => {
  it('CA-A.2.14: 12 posiciones con 0 en los meses sin obras; gana julio', () => {
    const items = [
      obra({ vistaEn: local(2026, 3, 1) }),
      obra({ vistaEn: local(2026, 3, 20) }),
      obra({ vistaEn: local(2026, 7, 1) }),
      obra({ vistaEn: local(2026, 7, 2) }),
      serie({ vistaEn: local(2026, 7, 31, 23, 59) }),
      obra({ vistaEn: local(2026, 11, 5) }),
    ];
    const r = resumenAnual(items, ANIO);
    expect(r.obrasPorMes).toEqual([0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 1, 0]);
    expect(r.mesTop).toBe(6);
  });

  it('CA-A.2.15: con empate gana el mes más reciente', () => {
    const items = [
      obra({ vistaEn: local(2026, 3, 1) }),
      obra({ vistaEn: local(2026, 3, 2) }),
      obra({ vistaEn: local(2026, 10, 1) }),
      obra({ vistaEn: local(2026, 10, 2) }),
    ];
    expect(resumenAnual(items, ANIO).mesTop).toBe(9);
  });

  it('D3: el 31 de diciembre a las 23:30 hora local cuenta en diciembre', () => {
    expect(resumenAnual([obra({ vistaEn: local(2025, 12, 31, 23, 30) })], 2025).obrasPorMes[11]).toBe(1);
  });
});

describe('D11 · obra destacada', () => {
  it('CA-A.2.16: la de mayor calificación; con empate, la de vistaEn más reciente', () => {
    const marzo = obra({ calificacionPersonal: 5, vistaEn: local(2026, 3, 1) });
    const cuatro = obra({ calificacionPersonal: 4, vistaEn: local(2026, 9, 1) });
    const junio = obra({ calificacionPersonal: 5, vistaEn: local(2026, 6, 1) });
    expect(resumenAnual([marzo, cuatro, junio], ANIO).destacada?.id).toBe(junio.id);
  });

  it('una serie también puede ser la destacada', () => {
    const laSerie = serie({ calificacionPersonal: 5 });
    expect(resumenAnual([obra({ calificacionPersonal: 3 }), laSerie], ANIO).destacada?.id).toBe(laSerie.id);
  });

  it('CA-A.2.17 (PA-6): con la misma calificación y la misma fecha gana el título por orden alfabético', () => {
    const mismaFecha = local(2026, 4, 4);
    const zodiac = obra({ titulo: 'Zodiac', calificacionPersonal: 5, vistaEn: mismaFecha });
    const anima = obra({ titulo: 'Ánima', calificacionPersonal: 5, vistaEn: mismaFecha });
    const avatar = obra({ titulo: 'Avatar', calificacionPersonal: 5, vistaEn: mismaFecha });
    expect(resumenAnual([zodiac, avatar, anima], ANIO).destacada?.id).toBe(anima.id);
  });

  it('CA-A.2.18: si ninguna obra está calificada, destacada es null', () => {
    expect(resumenAnual([obra(), serie()], ANIO).destacada).toBeNull();
  });

  it('una obra calificada de otro año no puede ser la destacada', () => {
    expect(resumenAnual([obra({ calificacionPersonal: 5, vistaEn: local(2025, 5, 5) })], ANIO).destacada).toBeNull();
  });
});

describe('D12 · año vacío', () => {
  it('CA-A.3.7: totales en 0, 12 meses en 0 y ningún "top"', () => {
    expect(resumenAnual([obra({ vistaEn: local(2025, 1, 1) })], ANIO)).toEqual({
      anio: ANIO,
      totalObras: 0,
      peliculas: 0,
      series: 0,
      horas: 0,
      peliculasSinDuracion: 0,
      obrasSinDatos: 0,
      generoTop: null,
      directorTop: null,
      obrasPorMes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      mesTop: null,
      destacada: null,
    });
  });
});

describe('elegirTop', () => {
  it('sin grupos devuelve null', () => {
    expect(elegirTop(new Map())).toBeNull();
  });
});
