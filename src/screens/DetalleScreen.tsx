import { useCallback, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../components/Boton';
import { Cargando, MensajeError } from '../components/EstadosPantalla';
import { Icono } from '../components/Icono';
import { Poster } from '../components/Poster';
import { useCartelera } from '../context/CarteleraContext';
import { usePeticion } from '../hooks/usePeticion';
import { obtenerDetalle } from '../services/tmdbService';
import { colores, espacio } from '../theme/tema';
import { ETIQUETA_TIPO } from '../types/lista';
import type { RootStackScreenProps } from '../types/navegacion';
import type { DetalleObra, MiembroElenco } from '../types/tmdb';
import { assertNever } from '../utils/assertNever';
import { formatearVotos } from '../utils/formato';
import { crearItemId } from '../utils/lista';

const SINOPSIS_ALTERNATIVA = 'Esta obra aún no tiene sinopsis disponible en español.';

export function DetalleScreen({ route, navigation }: RootStackScreenProps<'Detalle'>) {
  const { tipo, id } = route.params;
  const cargar = useCallback((signal: AbortSignal) => obtenerDetalle(tipo, id, signal), [tipo, id]);
  const { estado, reintentar } = usePeticion(cargar);

  switch (estado.tipo) {
    case 'cargando':
      return (
        <View style={styles.pantalla}>
          <Cargando />
        </View>
      );
    case 'error':
      return (
        <View style={styles.pantalla}>
          <MensajeError mensaje={estado.mensaje} onReintentar={reintentar} />
        </View>
      );
    case 'exito':
      return (
        <ContenidoDetalle
          obra={estado.datos}
          onEditar={(itemId) => navigation.navigate('EditarEntrada', { itemId })}
        />
      );
    default:
      return assertNever(estado);
  }
}

function ContenidoDetalle({ obra, onEditar }: { obra: DetalleObra; onEditar: (itemId: string) => void }) {
  const { obtenerItem, agregar } = useCartelera();
  const [agregando, setAgregando] = useState(false);
  const itemId = crearItemId(obra.tipo, obra.id);
  const yaEnLista = obtenerItem(itemId) !== undefined;

  const agregarALista = async () => {
    setAgregando(true);
    try {
      await agregar({
        tmdbId: obra.id,
        tipo: obra.tipo,
        titulo: obra.titulo,
        anio: obra.anio,
        posterPath: obra.posterPath,
      });
    } finally {
      setAgregando(false);
    }
  };

  const meta = [obra.anio, ETIQUETA_TIPO[obra.tipo], obra.infoAdicional].filter(Boolean).join(' · ');

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <View style={styles.cabecera}>
        <Poster path={obra.posterPath} uso="detalle" ancho={130} descripcion={`Póster de ${obra.titulo}`} />
        <View style={styles.cabeceraInfo}>
          <Text style={styles.titulo} accessibilityRole="header">
            {obra.titulo}
          </Text>
          <Text style={styles.meta}>{meta}</Text>
          {obra.generos.length > 0 && <Text style={styles.generos}>{obra.generos.join(', ')}</Text>}
          <View style={styles.calificacion} accessible accessibilityLabel={textoCalificacion(obra)}>
            <Icono name="star" size={18} color={colores.estrella} />
            {obra.votos > 0 ? (
              <Text style={styles.calificacionTexto}>
                {obra.calificacion.toFixed(1)}
                <Text style={styles.calificacionSecundaria}> /10 · {formatearVotos(obra.votos)} votos en TMDB</Text>
              </Text>
            ) : (
              <Text style={styles.calificacionSecundaria}>Sin calificaciones en TMDB</Text>
            )}
          </View>
        </View>
      </View>

      {yaEnLista ? (
        <Boton titulo="En mi lista · Editar" icono="checkmark-circle" variante="secundario" onPress={() => onEditar(itemId)} />
      ) : (
        <Boton titulo="Agregar a mi lista" icono="add-circle-outline" cargando={agregando} onPress={agregarALista} />
      )}

      <View style={styles.seccion}>
        <Text style={styles.subtitulo} accessibilityRole="header">
          Sinopsis
        </Text>
        <Text style={obra.sinopsis ? styles.parrafo : styles.parrafoAlternativo}>
          {obra.sinopsis ?? SINOPSIS_ALTERNATIVA}
        </Text>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.subtitulo} accessibilityRole="header">
          Elenco
        </Text>
        {obra.elenco.length === 0 ? (
          <Text style={styles.parrafoAlternativo}>No hay información del elenco.</Text>
        ) : (
          <FlatList
            horizontal
            data={obra.elenco}
            keyExtractor={(m) => String(m.id)}
            renderItem={({ item }) => <TarjetaActor miembro={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.elenco}
          />
        )}
      </View>
    </ScrollView>
  );
}

function TarjetaActor({ miembro }: { miembro: MiembroElenco }) {
  return (
    <View style={styles.actor}>
      <Poster path={miembro.fotoPath} uso="perfil" ancho={84} descripcion={`Foto de ${miembro.nombre}`} />
      <Text style={styles.actorNombre} numberOfLines={2}>
        {miembro.nombre}
      </Text>
      {miembro.personaje && (
        <Text style={styles.actorPersonaje} numberOfLines={2}>
          {miembro.personaje}
        </Text>
      )}
    </View>
  );
}

function textoCalificacion(obra: DetalleObra): string {
  return obra.votos > 0
    ? `Calificación de TMDB: ${obra.calificacion.toFixed(1)} de 10, ${obra.votos} votos`
    : 'Sin calificaciones en TMDB';
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espacio.lg,
    gap: espacio.lg,
    paddingBottom: espacio.xxl,
  },
  cabecera: {
    flexDirection: 'row',
    gap: espacio.lg,
  },
  cabeceraInfo: {
    flex: 1,
    gap: espacio.sm,
  },
  titulo: {
    color: colores.texto,
    fontSize: 22,
    fontWeight: '700',
  },
  meta: {
    color: colores.textoSecundario,
    fontSize: 14,
  },
  generos: {
    color: colores.textoSecundario,
    fontSize: 13,
  },
  calificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.xs,
    flexWrap: 'wrap',
  },
  calificacionTexto: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '700',
  },
  calificacionSecundaria: {
    color: colores.textoSecundario,
    fontSize: 13,
    fontWeight: '400',
  },
  seccion: {
    gap: espacio.sm,
  },
  subtitulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '600',
  },
  parrafo: {
    color: colores.texto,
    fontSize: 15,
    lineHeight: 22,
  },
  parrafoAlternativo: {
    color: colores.textoSecundario,
    fontSize: 15,
    fontStyle: 'italic',
  },
  elenco: {
    gap: espacio.md,
  },
  actor: {
    width: 84,
    gap: espacio.xs,
  },
  actorNombre: {
    color: colores.texto,
    fontSize: 13,
    fontWeight: '600',
  },
  actorPersonaje: {
    color: colores.textoSecundario,
    fontSize: 12,
  },
});
