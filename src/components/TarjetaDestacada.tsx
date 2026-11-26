import { StyleSheet, Text, View } from 'react-native';
import { colores, espacio, radio, tipografia } from '../tema/tema';
import type { ItemLista } from '../types/lista';
import { detalleDestacada } from '../utils/textosResumen';
import { Boton } from './Boton';
import { Estrellas } from './Estrellas';
import { Poster } from './Poster';

interface Props {
  /** D11: la obra mejor calificada del año, o null si ninguna está calificada. */
  obra: ItemLista | null;
  onIrAMiLista: () => void;
}

/** Obra destacada del año (DESIGN.md §3). */
export function TarjetaDestacada({ obra, onIrAMiLista }: Props) {
  if (!obra) {
    return (
      <View style={[styles.tarjeta, styles.vacia]}>
        <Text style={[styles.rotulo, styles.rotuloVacio]}>OBRA DESTACADA</Text>
        <Text style={styles.invitacion}>Califica las obras que viste para elegir tu destacada del año.</Text>
        <Boton titulo="Ir a Mi lista" variante="secundario" onPress={onIrAMiLista} />
      </View>
    );
  }

  return (
    <View style={styles.tarjeta}>
      <Poster path={obra.posterPath} uso="lista" ancho={84} descripcion={`Póster de ${obra.titulo}`} />
      <View style={styles.info}>
        <Text style={styles.rotulo}>OBRA DESTACADA</Text>
        <Text style={styles.titulo} accessibilityRole="header">
          {obra.titulo}
        </Text>
        <Estrellas valor={obra.calificacionPersonal} tamano={18} />
        <Text style={styles.detalle}>{detalleDestacada(obra)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    gap: espacio.lg,
    padding: espacio.lg,
    borderRadius: radio.lg,
    borderWidth: 1,
    borderColor: colores.celebracion,
    backgroundColor: colores.superficie,
  },
  vacia: {
    flexDirection: 'column',
    gap: espacio.md,
    borderStyle: 'dashed',
    borderColor: colores.borde,
  },
  info: {
    flex: 1,
    gap: espacio.xs,
  },
  rotulo: {
    ...tipografia.etiqueta,
    color: colores.celebracion,
    letterSpacing: 0.6,
  },
  rotuloVacio: {
    color: colores.textoSecundario,
  },
  titulo: {
    ...tipografia.titulo,
    color: colores.texto,
  },
  detalle: {
    ...tipografia.secundario,
    color: colores.textoSecundario,
  },
  invitacion: {
    ...tipografia.cuerpo,
    color: colores.texto,
  },
});
