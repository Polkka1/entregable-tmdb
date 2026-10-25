// Valores visuales compartidos por toda la app.

export const colores = {
  fondo: '#0F1115',
  superficie: '#1A1D24',
  superficieAlta: '#252932',
  borde: '#2F3440',
  texto: '#F2F3F5',
  textoSecundario: '#9AA0AA',
  acento: '#F2A541',
  textoSobreAcento: '#1A1206',
  peligro: '#E5484D',
  exito: '#3DD68C',
  estrella: '#F5C842',
} as const;

export const espacio = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radio = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

/** Alto mínimo de cualquier elemento tocable (principio de la Semana 6). */
export const ALTURA_TOCABLE_MIN = 44;
