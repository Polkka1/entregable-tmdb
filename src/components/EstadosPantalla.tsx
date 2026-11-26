// Vistas reutilizables para los estados de una petición: cargando, error y vacío.

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colores, espacio, tipografia } from '../tema/tema';
import { textoProgreso } from '../utils/textosResumen';
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

export function MensajeError({
  mensaje,
  onReintentar,
  titulo = 'Algo salió mal',
}: {
  mensaje: string;
  onReintentar?: () => void;
  titulo?: string;
}) {
  return (
    <View style={styles.centro} accessibilityLiveRegion="assertive">
      <Icono name="alert-circle-outline" size={48} color={colores.error} />
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.descripcion}>{mensaje}</Text>
      {onReintentar && (
        <View style={styles.accion}>
          <Boton titulo="Reintentar" icono="refresh" variante="secundario" onPress={onReintentar} />
        </View>
      )}
    </View>
  );
}

/** D6: avance del completado de datos de TMDB. Va encima del contenido, no lo reemplaza. */
export function Progreso({ hechas, total }: { hechas: number; total: number }) {
  const porcentaje = total === 0 ? 0 : Math.round((hechas / total) * 100);
  return (
    <View
      style={styles.progreso}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Completando datos"
      accessibilityValue={{ min: 0, max: total, now: hechas, text: textoProgreso(hechas, total) }}
    >
      <View style={styles.progresoCabeza}>
        <Text style={styles.progresoTitulo}>Completando datos</Text>
        <Text style={styles.progresoTexto}>{textoProgreso(hechas, total)}</Text>
      </View>
      <View style={styles.pista}>
        <View style={[styles.relleno, { width: `${porcentaje}%` }]} />
      </View>
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
    ...tipografia.subtitulo,
    fontWeight: '600',
    textAlign: 'center',
  },
  descripcion: {
    color: colores.textoSecundario,
    ...tipografia.cuerpo,
    textAlign: 'center',
  },
  accion: {
    marginTop: espacio.md,
    alignSelf: 'stretch',
  },
  progreso: {
    gap: espacio.sm,
    padding: espacio.md,
    backgroundColor: colores.superficie,
  },
  progresoCabeza: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacio.sm,
  },
  progresoTitulo: {
    ...tipografia.secundario,
    fontWeight: '600',
    color: colores.texto,
  },
  progresoTexto: {
    ...tipografia.secundario,
    color: colores.textoSecundario,
  },
  pista: {
    height: espacio.sm,
    backgroundColor: colores.borde,
    overflow: 'hidden',
  },
  relleno: {
    height: '100%',
    backgroundColor: colores.acento,
  },
});
