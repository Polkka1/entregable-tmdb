import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colores, espacio, radio } from '../theme/tema';
import { ETIQUETA_ESTADO, ETIQUETA_TIPO, type EstadoVisto, type ItemLista } from '../types/lista';
import { Estrellas } from './Estrellas';
import { Icono } from './Icono';
import { Poster } from './Poster';

const COLOR_ESTADO: Record<EstadoVisto, string> = {
  por_ver: colores.textoSecundario,
  viendo: colores.acento,
  vista: colores.exito,
};

interface Props {
  item: ItemLista;
  onPress: (item: ItemLista) => void;
}

function TarjetaListaBase({ item, onPress }: Props) {
  const { titulo, anio, tipo, posterPath, estado, calificacionPersonal, comentario } = item;
  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}, ${ETIQUETA_TIPO[tipo]}, ${ETIQUETA_ESTADO[estado]}. Toca para editar.`}
      android_ripple={{ color: colores.superficieAlta }}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}
    >
      <Poster path={posterPath} uso="lista" ancho={64} descripcion={`Póster de ${titulo}`} />
      <View style={styles.info}>
        <Text style={styles.titulo} numberOfLines={2}>
          {titulo}
        </Text>
        <Text style={styles.meta}>
          {anio || 'Sin fecha'} · {ETIQUETA_TIPO[tipo]}
        </Text>
        <View style={styles.fila}>
          <View style={[styles.insignia, { borderColor: COLOR_ESTADO[estado] }]}>
            <Text style={[styles.insigniaTexto, { color: COLOR_ESTADO[estado] }]}>{ETIQUETA_ESTADO[estado]}</Text>
          </View>
          {calificacionPersonal !== null && <Estrellas valor={calificacionPersonal} tamano={14} />}
        </View>
        {comentario.length > 0 && (
          <Text style={styles.comentario} numberOfLines={1}>
            “{comentario}”
          </Text>
        )}
      </View>
      <Icono name="create-outline" size={20} color={colores.textoSecundario} />
    </Pressable>
  );
}

export const TarjetaLista = memo(TarjetaListaBase);

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.md,
    padding: espacio.sm,
    borderRadius: radio.md,
    backgroundColor: colores.superficie,
  },
  presionada: {
    opacity: 0.85,
  },
  info: {
    flex: 1,
    gap: espacio.xs,
  },
  titulo: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: colores.textoSecundario,
    fontSize: 14,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
  },
  insignia: {
    borderWidth: 1,
    borderRadius: radio.pill,
    paddingHorizontal: espacio.sm,
    paddingVertical: 2,
  },
  insigniaTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  comentario: {
    color: colores.textoSecundario,
    fontSize: 13,
    fontStyle: 'italic',
  },
});
