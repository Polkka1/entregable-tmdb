import { StyleSheet, Text, View } from 'react-native';
import { colores, espacio, radio, tipografia } from '../tema/tema';
import { etiquetaBarra, nombreMes, textoMesTop } from '../utils/textosResumen';

const ALTO_BARRAS = 120;
const ALTO_MES_VACIO = 2;

interface Props {
  /** 12 posiciones, enero = 0 (D10) */
  obrasPorMes: number[];
  mesTop: number | null;
}

/** Una barra por mes, hecha con View (sin librerías de gráficas). DESIGN.md §3. */
export function BarrasPorMes({ obrasPorMes, mesTop }: Props) {
  const maximo = Math.max(1, ...obrasPorMes);
  return (
    <View style={styles.tarjeta}>
      <View style={styles.cabeza}>
        <Text style={styles.titulo} accessibilityRole="header">
          Mes más activo
        </Text>
        {mesTop !== null && <Text style={styles.top}>{textoMesTop(mesTop, obrasPorMes[mesTop])}</Text>}
      </View>
      <View style={styles.columnas}>
        {obrasPorMes.map((obras, mes) => {
          const esTop = mes === mesTop;
          const alto = obras === 0 ? ALTO_MES_VACIO : Math.max(ALTO_MES_VACIO, (obras / maximo) * ALTO_BARRAS);
          return (
            <View key={mes} style={styles.columna} accessible accessibilityLabel={etiquetaBarra(mes, obras)}>
              <Text style={[styles.numero, esTop && styles.textoTop]}>{obras}</Text>
              <View
                style={[styles.barra, { height: alto }, obras === 0 && styles.barraVacia, esTop && styles.barraTop]}
              />
              <Text style={[styles.mes, esTop && styles.textoTop]}>{nombreMes(mes).charAt(0).toUpperCase()}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    gap: espacio.lg,
    padding: espacio.lg,
    borderRadius: radio.lg,
    backgroundColor: colores.superficie,
  },
  cabeza: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: espacio.sm,
  },
  titulo: {
    ...tipografia.subtitulo,
    color: colores.texto,
  },
  top: {
    ...tipografia.subtitulo,
    color: colores.celebracion,
  },
  columnas: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: espacio.xs,
  },
  columna: {
    flex: 1,
    alignItems: 'center',
    gap: espacio.xs,
  },
  numero: {
    ...tipografia.etiqueta,
    color: colores.textoSecundario,
    fontVariant: ['tabular-nums'],
  },
  barra: {
    width: '100%',
    maxWidth: 18,
    borderTopLeftRadius: radio.sm,
    borderTopRightRadius: radio.sm,
    backgroundColor: colores.acento,
  },
  barraVacia: {
    backgroundColor: colores.borde,
  },
  barraTop: {
    backgroundColor: colores.celebracion,
  },
  mes: {
    ...tipografia.etiqueta,
    color: colores.textoSecundario,
  },
  textoTop: {
    color: colores.celebracion,
    fontWeight: '700',
  },
});
