// Vistas reutilizables para los estados de una petición: cargando, error y vacío.

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colores, espacio } from '../theme/tema';
import { Boton } from './Boton';
import { Icono, type NombreIcono } from './Icono';

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <View style={styles.centro} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colores.acento} />
      <Text style={styles.descripcion}>{texto}</Text>
    </View>
  );
}

export function MensajeError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <View style={styles.centro} accessibilityLiveRegion="assertive">
      <Icono name="alert-circle-outline" size={48} color={colores.peligro} />
      <Text style={styles.titulo}>Algo salió mal</Text>
      <Text style={styles.descripcion}>{mensaje}</Text>
      {onReintentar && (
        <View style={styles.accion}>
          <Boton titulo="Reintentar" icono="refresh" variante="secundario" onPress={onReintentar} />
        </View>
      )}
    </View>
  );
}

interface PropsVacio {
  icono: NombreIcono;
  titulo: string;
  descripcion?: string;
  accion?: { titulo: string; onPress: () => void };
}

export function MensajeVacio({ icono, titulo, descripcion, accion }: PropsVacio) {
  return (
    <View style={styles.centro}>
      <Icono name={icono} size={48} color={colores.textoSecundario} />
      <Text style={styles.titulo}>{titulo}</Text>
      {descripcion && <Text style={styles.descripcion}>{descripcion}</Text>}
      {accion && (
        <View style={styles.accion}>
          <Boton titulo={accion.titulo} onPress={accion.onPress} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacio.xl,
    gap: espacio.sm,
  },
  titulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  descripcion: {
    color: colores.textoSecundario,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
  },
  accion: {
    marginTop: espacio.md,
    alignSelf: 'stretch',
  },
});
