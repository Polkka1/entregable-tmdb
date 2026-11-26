import { StyleSheet, View } from 'react-native';
import { colorEstado, espacio } from '../tema/tema';
import { ESTADOS, ETIQUETA_ESTADO, type EstadoVisto } from '../types/lista';
import { Chip } from './Chip';

interface Props {
  valor: EstadoVisto;
  onCambiar: (estado: EstadoVisto) => void;
}

/** Por ver, Viendo y Vista: punto del color del estado y, el seleccionado, relleno con ese color (DESIGN.md §3). */
export function SelectorEstado({ valor, onCambiar }: Props) {
  return (
    <View style={styles.fila} accessibilityRole="radiogroup" accessibilityLabel="Estado">
      {ESTADOS.map((estado) => (
        <Chip
          key={estado}
          etiqueta={ETIQUETA_ESTADO[estado]}
          seleccionado={valor === estado}
          colorSeleccionado={colorEstado[estado]}
          colorPunto={colorEstado[estado]}
          onPress={() => onCambiar(estado)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacio.sm,
  },
});
