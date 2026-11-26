import { StyleSheet, Text, View } from 'react-native';
import { colores, espacio, radio, tipografia } from '../tema/tema';
import { Icono } from './Icono';

interface Props {
  rotulo: string;
  valor: string;
  detalle?: string;
  /** Qué falta y por qué (D6, D7, D9). Va debajo, separado por un borde. */
  falta?: string | null;
  /** El valor es un nombre (género, director): se muestra en `subtitulo` en lugar de `dato`. */
  valorEsNombre?: boolean;
}

/** Tarjeta con un dato del resumen (DESIGN.md §3). */
export function TarjetaDato({ rotulo, valor, detalle, falta, valorEsNombre = false }: Props) {
  return (
    <View
      style={styles.tarjeta}
      accessible
      accessibilityLabel={[rotulo, valor, detalle, falta].filter(Boolean).join('. ')}
    >
      <Text style={styles.rotulo}>{rotulo.toUpperCase()}</Text>
      <Text style={valorEsNombre ? styles.nombre : styles.valor}>{valor}</Text>
      {detalle ? <Text style={styles.detalle}>{detalle}</Text> : null}
      {falta ? (
        <View style={styles.falta}>
          <Icono name="information-circle-outline" size={16} color={colores.textoSecundario} />
          <Text style={styles.faltaTexto}>{falta}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flex: 1,
    gap: espacio.xs,
    padding: espacio.lg,
    borderRadius: radio.lg,
    backgroundColor: colores.superficie,
  },
  rotulo: {
    ...tipografia.etiqueta,
    color: colores.textoSecundario,
    letterSpacing: 0.6,
  },
  valor: {
    ...tipografia.dato,
    color: colores.texto,
    fontVariant: ['tabular-nums'],
  },
  nombre: {
    ...tipografia.subtitulo,
    color: colores.texto,
  },
  detalle: {
    ...tipografia.secundario,
    color: colores.textoSecundario,
  },
  falta: {
    flexDirection: 'row',
    gap: espacio.xs,
    marginTop: espacio.sm,
    paddingTop: espacio.sm,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  faltaTexto: {
    ...tipografia.secundario,
    flex: 1,
    color: colores.textoSecundario,
  },
});
