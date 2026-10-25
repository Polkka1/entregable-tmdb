import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colores, espacio, radio } from '../theme/tema';
import { ETIQUETA_TIPO } from '../types/lista';
import type { ResultadoBusqueda } from '../types/tmdb';
import { Icono } from './Icono';
import { Poster } from './Poster';

interface Props {
  resultado: ResultadoBusqueda;
  enMiLista: boolean;
  onPress: (resultado: ResultadoBusqueda) => void;
}

function TarjetaResultadoBase({ resultado, enMiLista, onPress }: Props) {
  const { titulo, anio, tipo, posterPath } = resultado;
  return (
    <Pressable
      onPress={() => onPress(resultado)}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}${anio ? `, ${anio}` : ''}, ${ETIQUETA_TIPO[tipo]}`}
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
        {enMiLista && (
          <View style={styles.enLista}>
            <Icono name="checkmark-circle" size={14} color={colores.exito} />
            <Text style={styles.enListaTexto}>En mi lista</Text>
          </View>
        )}
      </View>
      <Icono name="chevron-forward" size={20} color={colores.textoSecundario} />
    </Pressable>
  );
}

export const TarjetaResultado = memo(TarjetaResultadoBase);

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
  enLista: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.xs,
  },
  enListaTexto: {
    color: colores.exito,
    fontSize: 13,
  },
});
