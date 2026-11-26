import { Pressable, StyleSheet, Text } from 'react-native';
import { ALTURA_TOCABLE_MIN, colores, espacio, radio, tipografia } from '../tema/tema';

interface Props {
  etiqueta: string;
  seleccionado: boolean;
  onPress: () => void;
  /** Color de relleno al estar seleccionado (por ejemplo, el de un estado). Por defecto, el acento. */
  colorSeleccionado?: string;
  /** Texto para lectores de pantalla, si debe ser distinto de la etiqueta (por ejemplo "Año 2025"). */
  descripcion?: string;
}

/** Opción de filtro o selector de un solo valor (DESIGN.md §3). */
export function Chip({ etiqueta, seleccionado, onPress, colorSeleccionado, descripcion }: Props) {
  const relleno = colorSeleccionado ?? colores.acento;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={descripcion}
      accessibilityState={{ selected: seleccionado }}
      style={({ pressed }) => [
        styles.chip,
        seleccionado && { backgroundColor: relleno, borderColor: relleno },
        pressed && styles.presionado,
      ]}
    >
      <Text style={[styles.texto, seleccionado && styles.textoSeleccionado]}>{etiqueta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: ALTURA_TOCABLE_MIN,
    paddingHorizontal: espacio.lg,
    borderRadius: radio.pill,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: {
    opacity: 0.8,
  },
  texto: {
    ...tipografia.secundario,
    fontWeight: '600',
    color: colores.texto,
  },
  textoSeleccionado: {
    // Sobre el acento o sobre un color de estado, el texto usa el color de fondo (DESIGN.md §2.1).
    color: colores.textoSobreAcento,
    fontWeight: '700',
  },
});
