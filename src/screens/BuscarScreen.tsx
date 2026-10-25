import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Boton } from '../components/Boton';
import { Cargando, MensajeError, MensajeVacio } from '../components/EstadosPantalla';
import { Icono } from '../components/Icono';
import { TarjetaResultado } from '../components/TarjetaResultado';
import { useCartelera } from '../context/CarteleraContext';
import { useBusqueda, type EstadoBusqueda } from '../hooks/useBusqueda';
import { ALTURA_TOCABLE_MIN, colores, espacio, radio } from '../theme/tema';
import type { TabsScreenProps } from '../types/navegacion';
import type { ResultadoBusqueda } from '../types/tmdb';
import { assertNever } from '../utils/assertNever';
import { crearItemId } from '../utils/lista';

export function BuscarScreen({ navigation }: TabsScreenProps<'Buscar'>) {
  const [texto, setTexto] = useState('');
  const { consulta, estado, hayMas, cargandoMas, errorMas, cargarMas, reintentar, minCaracteres } =
    useBusqueda(texto);
  const { lista } = useCartelera();
  const idsEnLista = useMemo(() => new Set(lista.map((i) => i.id)), [lista]);

  const abrirDetalle = useCallback(
    (r: ResultadoBusqueda) => navigation.navigate('Detalle', { tipo: r.tipo, id: r.id, titulo: r.titulo }),
    [navigation],
  );

  const renderResultados = (datos: Extract<EstadoBusqueda, { tipo: 'exito' }>['datos']) => {
    if (datos.resultados.length === 0) {
      return (
        <MensajeVacio
          icono="search-outline"
          titulo="Sin resultados"
          descripcion={`No encontramos películas ni series para «${consulta}».`}
        />
      );
    }
    return (
      <FlatList
        data={datos.resultados}
        keyExtractor={(r) => crearItemId(r.tipo, r.id)}
        renderItem={({ item }) => (
          <TarjetaResultado
            resultado={item}
            enMiLista={idsEnLista.has(crearItemId(item.tipo, item.id))}
            onPress={abrirDetalle}
          />
        )}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={Separador}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={cargarMas}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          <View style={styles.pie}>
            {cargandoMas && <ActivityIndicator color={colores.acento} />}
            {errorMas && (
              <>
                <Text style={styles.errorMas}>{errorMas}</Text>
                <Boton titulo="Cargar más" variante="secundario" onPress={cargarMas} />
              </>
            )}
            {!hayMas && !cargandoMas && <Text style={styles.finLista}>No hay más resultados</Text>}
          </View>
        }
      />
    );
  };

  const renderContenido = () => {
    switch (estado.tipo) {
      case 'inactivo':
        return (
          <MensajeVacio
            icono="film-outline"
            titulo="Busca películas y series"
            descripcion={`Escribe al menos ${minCaracteres} letras del título.`}
          />
        );
      case 'cargando':
        return <Cargando texto="Buscando…" />;
      case 'error':
        return <MensajeError mensaje={estado.mensaje} onReintentar={reintentar} />;
      case 'exito':
        return renderResultados(estado.datos);
      default:
        return assertNever(estado);
    }
  };

  return (
    <View style={styles.pantalla}>
      <View style={styles.campo}>
        <Icono name="search" size={20} color={colores.textoSecundario} />
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Título de película o serie"
          placeholderTextColor={colores.textoSecundario}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
          autoCorrect={false}
          accessibilityLabel="Buscar por título"
        />
        {texto.length > 0 && (
          <Pressable
            onPress={() => setTexto('')}
            accessibilityRole="button"
            accessibilityLabel="Borrar búsqueda"
            style={styles.borrar}
          >
            <Icono name="close-circle" size={20} color={colores.textoSecundario} />
          </Pressable>
        )}
      </View>
      {renderContenido()}
    </View>
  );
}

function Separador() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
    margin: espacio.lg,
    paddingLeft: espacio.md,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  input: {
    flex: 1,
    minHeight: ALTURA_TOCABLE_MIN + 4,
    color: colores.texto,
    fontSize: 16,
  },
  borrar: {
    minWidth: ALTURA_TOCABLE_MIN,
    minHeight: ALTURA_TOCABLE_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lista: {
    paddingHorizontal: espacio.lg,
    paddingBottom: espacio.xl,
  },
  separador: {
    height: espacio.sm,
  },
  pie: {
    paddingVertical: espacio.lg,
    gap: espacio.sm,
    alignItems: 'stretch',
  },
  errorMas: {
    color: colores.peligro,
    textAlign: 'center',
  },
  finLista: {
    color: colores.textoSecundario,
    textAlign: 'center',
    fontSize: 13,
  },
});
