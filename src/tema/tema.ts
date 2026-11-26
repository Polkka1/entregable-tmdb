// Tokens de diseño: la única fuente de verdad de colores, tipografía, espacios y tamaños.
// Los valores y su uso están en DESIGN.md §2 y en docs/diseno/brand-board.html.
import type { TextStyle } from 'react-native';
import type { EstadoVisto } from '../types/lista';

const paleta = {
  fondo: '#0F1115',
  superficie: '#1A1D24',
  superficieAlta: '#252932',
  borde: '#2F3440',
  texto: '#F2F3F5',
  textoSecundario: '#A3A9B5',
  acento: '#9D8CFF',
  textoSobreAcento: '#0F1115',
  celebracion: '#F5C542',
  textoSobreCelebracion: '#1A1206',
  estadoPorVer: '#9DADC4',
  estadoViendo: '#4CC9F0',
  estadoVista: '#45D49B',
  error: '#FF6B6B',
  // Degradado oficial del logo de TMDB: solo para TmdbLogo.
  tmdb1: '#90CEA1',
  tmdb2: '#3CBEC9',
  tmdb3: '#00B3E5',
} as const;

export const colores = paleta;

/** Color de cada estado (DESIGN.md §2.1): siempre acompañado de su texto. */
export const colorEstado: Record<EstadoVisto, string> = {
  por_ver: paleta.estadoPorVer,
  viendo: paleta.estadoViendo,
  vista: paleta.estadoVista,
};

type EstiloTexto = Required<Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight'>>;

/** Escala tipográfica (fuente del sistema). Se aplica con spread: `{ ...tipografia.dato, color }`. */
export const tipografia = {
  display: { fontSize: 40, lineHeight: 48, fontWeight: '800' },
  dato: { fontSize: 32, lineHeight: 38, fontWeight: '700' },
  titulo: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  subtitulo: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  cuerpo: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  secundario: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  etiqueta: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
} as const satisfies Record<string, EstiloTexto>;

export const espacio = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radio = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

/** Alto mínimo de cualquier elemento tocable. El botón usa ALTURA_TOCABLE_MIN + 4. */
export const ALTURA_TOCABLE_MIN = 44;
