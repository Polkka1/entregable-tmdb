import { describe, expect, it } from 'vitest';
import { local } from '../dominio/fabricaDePrueba';
import {
  avisoSinConexion,
  avisoSinDatos,
  avisoSinDuracion,
  contar,
  detalleDestacada,
  detalleTipos,
  etiquetaBarra,
  nombreMes,
  textoHoras,
  textoMesTop,
  textoProgreso,
  tituloVacio,
} from './textosResumen';

// Textos de DESIGN.md §5 y criterios CA-A.2.6, CA-A.4.7, CA-A.5.4 y CA-A.3.7.

describe('contar', () => {
  it('usa el singular solo con 1', () => {
    expect(contar(1, 'obra', 'obras')).toBe('1 obra');
    expect(contar(0, 'obra', 'obras')).toBe('0 obras');
    expect(contar(42, 'obra', 'obras')).toBe('42 obras');
  });
});

describe('textoHoras (D7)', () => {
  it('muestra un decimal con coma', () => {
    expect(textoHoras(37.5)).toBe('37,5 h');
    expect(textoHoras(2)).toBe('2,0 h');
    expect(textoHoras(0)).toBe('0,0 h');
  });
});

describe('detalleTipos', () => {
  it('cuenta películas y series con su plural', () => {
    expect(detalleTipos(31, 11)).toBe('31 películas · 11 series');
    expect(detalleTipos(1, 1)).toBe('1 película · 1 serie');
  });
});

describe('avisos de datos faltantes', () => {
  it('CA-A.2.6 (D7): películas sin duración, con su plural; nada si son 0', () => {
    expect(avisoSinDuracion(0)).toBeNull();
    expect(avisoSinDuracion(1)).toBe('1 película sin duración no suma horas.');
    expect(avisoSinDuracion(2)).toBe('2 películas sin duración no suman horas.');
  });

  it('CA-A.4.7 (D6): obras sin datos de TMDB, con su plural; nada si son 0', () => {
    expect(avisoSinDatos(0)).toBeNull();
    expect(avisoSinDatos(1)).toBe(
      '1 obra quedó sin datos de TMDB: cuenta en el total, pero no en horas, géneros ni directores.',
    );
    expect(avisoSinDatos(3)).toBe(
      '3 obras quedaron sin datos de TMDB: cuentan en el total, pero no en horas, géneros ni directores.',
    );
  });

  it('CA-A.5.4 (D13, PA-1): sin conexión, y cuántas obras vistas aún no tienen fecha', () => {
    expect(avisoSinConexion(0)).toBe('Sin conexión: estás viendo tu última copia guardada.');
    expect(avisoSinConexion(1)).toBe(
      'Sin conexión: estás viendo tu última copia guardada. 1 obra vista aún no tiene fecha y se sumará al reconectar.',
    );
    expect(avisoSinConexion(2)).toBe(
      'Sin conexión: estás viendo tu última copia guardada. 2 obras vistas aún no tienen fecha y se sumarán al reconectar.',
    );
  });
});

describe('otros textos', () => {
  it('CA-A.3.7 (D12): título del año vacío', () => {
    expect(tituloVacio(2024)).toBe('Aún no hay obras vistas en 2024.');
  });

  it('D6: progreso del completado', () => {
    expect(textoProgreso(2, 5)).toBe('2 de 5 obras');
    expect(textoProgreso(0, 1)).toBe('0 de 1 obra');
  });

  it('D10: nombres de los meses, mes más activo y etiqueta de cada barra', () => {
    expect(nombreMes(0)).toBe('enero');
    expect(nombreMes(11)).toBe('diciembre');
    expect(textoMesTop(6, 8)).toBe('Julio · 8 obras');
    expect(etiquetaBarra(6, 1)).toBe('julio: 1 obra');
  });

  it('D11: detalle de la obra destacada con la fecha en hora local', () => {
    expect(detalleDestacada({ tipo: 'movie', vistaEn: local(2026, 3, 12, 22, 0) })).toBe(
      'Película · vista el 12 de marzo',
    );
    expect(detalleDestacada({ tipo: 'tv', vistaEn: null })).toBe('Serie');
  });
});
