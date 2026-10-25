import { StyleSheet, Text, View } from 'react-native';
import { colores, espacio } from '../theme/tema';
import { Icono } from './Icono';

/** Aviso de RF8: la lista que se ve es la última copia guardada en el dispositivo. */
export function AvisoSinConexion() {
  return (
    <View style={styles.aviso} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icono name="cloud-offline-outline" size={20} color={colores.textoSobreAcento} />
      <Text style={styles.texto}>
        Sin conexión con el servidor. Estás viendo la última copia guardada; los cambios se activarán al reconectar.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
    paddingHorizontal: espacio.lg,
    paddingVertical: espacio.sm,
    backgroundColor: colores.acento,
  },
  texto: {
    flex: 1,
    color: colores.textoSobreAcento,
    fontSize: 13,
    fontWeight: '500',
  },
});
