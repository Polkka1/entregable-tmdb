import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Boton } from '../components/Boton';

import { MensajeVacio } from '../components/EstadosPantalla';
import { Estrellas } from '../components/Estrellas';
import { Poster } from '../components/Poster';
import { SelectorEstado } from '../components/SelectorEstado';
import { useCartelera } from '../context/CarteleraContext';
import { colores, espacio, tipografia } from '../tema/tema';
import { ETIQUETA_ESTADO, ETIQUETA_TIPO, MAX_COMENTARIO, type EstadoVisto, type ItemLista } from '../types/lista';
import type { RootStackScreenProps } from '../types/navegacion';
import { mensajeDeError } from '../utils/errores';

export function EditarEntradaScreen({ route, navigation }: RootStackScreenProps<'EditarEntrada'>) {
  const { obtenerItem } = useCartelera();
  const item = obtenerItem(route.params.itemId);

  if (!item) {
    return (
      <View style={styles.pantalla}>
        <MensajeVacio
          icono="alert-circle-outline"
          titulo="Esta obra ya no está en tu lista"
          accion={{ titulo: 'Volver', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  return <FormularioEntrada item={item} onTerminar={() => navigation.goBack()} />;
}

function FormularioEntrada({ item, onTerminar }: { item: ItemLista; onTerminar: () => void }) {
  const { actualizar, eliminar } = useCartelera();
  const [estado, setEstado] = useState<EstadoVisto>(item.estado);
  const [calificacion, setCalificacion] = useState<number | null>(item.calificacionPersonal);
  const [comentario, setComentario] = useState(item.comentario);
  const [guardando, setGuardando] = useState(false);

  const puedeCalificar = estado === 'vista';

  const cambiarEstado = (nuevo: EstadoVisto) => {
    setEstado(nuevo);
    // Regla RF6: solo se califica si el estado es 'vista'
    if (nuevo !== 'vista') setCalificacion(null);
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      await actualizar(item.id, { estado, calificacionPersonal: calificacion, comentario });
      onTerminar();
    } catch (error) {
      Alert.alert('No se pudo guardar', mensajeDeError(error));
    } finally {
      setGuardando(false);
    }
  };

  const confirmarQuitar = () => {
    Alert.alert('Quitar de mi lista', `¿Seguro que quieres quitar «${item.titulo}» de tu lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminar(item.id);
            onTerminar();
          } catch (error) {
            Alert.alert('No se pudo quitar', mensajeDeError(error));
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.cabecera}>
          <Poster path={item.posterPath} uso="lista" ancho={56} descripcion={`Póster de ${item.titulo}`} />
          <View style={styles.cabeceraInfo}>
            <Text style={styles.titulo} numberOfLines={2}>
              {item.titulo}
            </Text>
            <Text style={styles.meta}>
              {item.anio || 'Sin fecha'} · {ETIQUETA_TIPO[item.tipo]}
            </Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Estado</Text>
          <SelectorEstado valor={estado} onCambiar={cambiarEstado} />
        </View>

        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Mi calificación</Text>
          <Estrellas valor={calificacion} onCambiar={setCalificacion} deshabilitado={!puedeCalificar} tamano={30} />
          {!puedeCalificar && (
            <Text style={styles.ayuda}>Solo puedes calificar cuando el estado es «{ETIQUETA_ESTADO.vista}».</Text>
          )}
        </View>

        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Comentario</Text>
          <TextInput
            value={comentario}
            onChangeText={setComentario}
            maxLength={MAX_COMENTARIO}
            multiline
            placeholder="¿Qué te pareció?"
            placeholderTextColor={colores.textoSecundario}
            style={styles.comentario}
            textAlignVertical="top"
            accessibilityLabel="Comentario"
          />
          <Text style={styles.contador}>
            {comentario.length}/{MAX_COMENTARIO}
          </Text>
        </View>

        <View style={styles.acciones}>
          <Boton titulo="Guardar cambios" icono="save-outline" cargando={guardando} onPress={guardar} />
          <Boton titulo="Quitar de mi lista" icono="trash-outline" variante="peligro" onPress={confirmarQuitar} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espacio.lg,
    gap: espacio.xl,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.md,
  },
  cabeceraInfo: {
    flex: 1,
    gap: espacio.xs,
  },
  titulo: {
    color: colores.texto,
    ...tipografia.subtitulo,
    fontWeight: '700',
  },
  meta: {
    color: colores.textoSecundario,
    ...tipografia.secundario,
  },
  seccion: {
    gap: espacio.sm,
  },
  etiqueta: {
    color: colores.texto,
    ...tipografia.cuerpo,
    fontWeight: '600',
  },
  ayuda: {
    color: colores.textoSecundario,
    ...tipografia.secundario,
  },
  comentario: {
    minHeight: 120,
    padding: espacio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    color: colores.texto,
    ...tipografia.cuerpo,
  },
  contador: {
    color: colores.textoSecundario,
    ...tipografia.etiqueta,
    textAlign: 'right',
  },
  acciones: {
    gap: espacio.md,
  },
});
