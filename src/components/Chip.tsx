import { Pressable, StyleSheet, Text } from 'react-native';
import { ALTURA_TOCABLE_MIN, colores, espacio, radio } from '../theme/tema';

interface Props {
  etiqueta: string;
  seleccionado: boolean;
  onPress: () => void;
}

/** Opción de filtro o selector de un solo valor. */
export function Chip({ etiqueta, seleccionado, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: seleccionado }}
      style={({ pressed }) => [styles.chip, seleccionado && styles.seleccionado, pressed && styles.presionado]}
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
  seleccionado: {
    backgroundColor: colores.acento,
    borderColor: colores.acento,
  },
  presionado: {
    opacity: 0.8,
  },
  texto: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '500',
  },
  textoSeleccionado: {
    color: colores.textoSobreAcento,
    fontWeight: '700',
  },
});
