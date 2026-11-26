import { ScrollView, StyleSheet } from 'react-native';
import { espacio } from '../tema/tema';
import { Chip } from './Chip';

interface Props {
  /** D4: del más reciente al más antiguo */
  anios: number[];
  seleccionado: number;
  onCambiar: (anio: number) => void;
}

/** Fila horizontal de años (DESIGN.md §3). */
export function SelectorAnio({ anios, seleccionado, onCambiar }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.fila}
      accessibilityRole="radiogroup"
      accessibilityLabel="Año del resumen"
    >
      {anios.map((anio) => (
        <Chip
          key={anio}
          etiqueta={String(anio)}
          descripcion={`Año ${anio}`}
          seleccionado={anio === seleccionado}
          onPress={() => onCambiar(anio)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fila: {
    gap: espacio.sm,
  },
});
