import { Pressable, StyleSheet, View } from 'react-native';
import { ALTURA_TOCABLE_MIN, colores } from '../theme/tema';
import { CALIFICACION_MAX, CALIFICACION_MIN } from '../types/lista';
import { Icono } from './Icono';

const VALORES = Array.from(
  { length: CALIFICACION_MAX - CALIFICACION_MIN + 1 },
  (_, i) => CALIFICACION_MIN + i,
);

interface Props {
  valor: number | null;
  /** Sin onCambiar las estrellas solo se muestran. Tocar la estrella actual borra la calificación. */
  onCambiar?: (valor: number | null) => void;
  deshabilitado?: boolean;
  tamano?: number;
}

export function Estrellas({ valor, onCambiar, deshabilitado = false, tamano = 18 }: Props) {
  const actual = valor ?? 0;

  if (!onCambiar) {
    return (
      <View style={styles.fila} accessible accessibilityLabel={`Calificación: ${actual} de ${CALIFICACION_MAX}`}>
        {VALORES.map((n) => (
          <Icono key={n} name={n <= actual ? 'star' : 'star-outline'} size={tamano} color={colores.estrella} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.fila} accessibilityRole="adjustable" accessibilityLabel="Calificación personal">
      {VALORES.map((n) => (
        <Pressable
          key={n}
          disabled={deshabilitado}
          onPress={() => onCambiar(n === valor ? null : n)}
          accessibilityRole="button"
          accessibilityLabel={`${n} de ${CALIFICACION_MAX} estrellas`}
          accessibilityState={{ selected: n <= actual, disabled: deshabilitado }}
          style={[styles.tocable, deshabilitado && styles.deshabilitado]}
        >
          <Icono name={n <= actual ? 'star' : 'star-outline'} size={tamano} color={colores.estrella} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tocable: {
    minWidth: ALTURA_TOCABLE_MIN,
    minHeight: ALTURA_TOCABLE_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deshabilitado: {
    opacity: 0.35,
  },
});
