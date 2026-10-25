import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ALTURA_TOCABLE_MIN, colores, espacio, radio } from '../theme/tema';
import { Icono, type NombreIcono } from './Icono';

type Variante = 'primario' | 'secundario' | 'peligro';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icono?: NombreIcono;
  cargando?: boolean;
  deshabilitado?: boolean;
}

const COLOR_TEXTO: Record<Variante, string> = {
  primario: colores.textoSobreAcento,
  secundario: colores.texto,
  peligro: colores.peligro,
};

export function Boton({ titulo, onPress, variante = 'primario', icono, cargando = false, deshabilitado = false }: Props) {
  const inactivo = deshabilitado || cargando;
  const colorTexto = COLOR_TEXTO[variante];

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        pressed && styles.presionado,
        inactivo && styles.inactivo,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        <View style={styles.contenido}>
          {icono && <Icono name={icono} size={20} color={colorTexto} />}
          <Text style={[styles.texto, { color: colorTexto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: ALTURA_TOCABLE_MIN + 4,
    paddingHorizontal: espacio.lg,
    borderRadius: radio.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: {
    backgroundColor: colores.acento,
  },
  secundario: {
    backgroundColor: colores.superficieAlta,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  peligro: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colores.peligro,
  },
  presionado: {
    opacity: 0.8,
  },
  inactivo: {
    opacity: 0.5,
  },
  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
  },
  texto: {
    fontSize: 16,
    fontWeight: '600',
  },
});
