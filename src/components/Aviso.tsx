import { StyleSheet, Text, View } from 'react-native';
import { colores, espacio, tipografia } from '../tema/tema';
import { Icono, type NombreIcono } from './Icono';

export type TipoAviso = 'sinConexion' | 'datosFaltantes';

const ESTILO_AVISO: Record<TipoAviso, { color: string; icono: NombreIcono }> = {
  sinConexion: { color: colores.acento, icono: 'cloud-offline-outline' },
  datosFaltantes: { color: colores.celebracion, icono: 'information-circle-outline' },
};

/** Aviso que va encima del contenido sin reemplazarlo (DESIGN.md §3). */
export function Aviso({ tipo, texto }: { tipo: TipoAviso; texto: string }) {
  const { color, icono } = ESTILO_AVISO[tipo];
  return (
    <View style={[styles.aviso, { borderLeftColor: color }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icono name={icono} size={20} color={color} />
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacio.sm,
    padding: espacio.md,
    borderLeftWidth: 4,
    backgroundColor: colores.superficieAlta,
  },
  texto: {
    ...tipografia.secundario,
    flex: 1,
    color: colores.texto,
  },
});
