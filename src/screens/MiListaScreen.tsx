import { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from '../components/Chip';
import { MensajeVacio } from '../components/EstadosPantalla';
import { TarjetaLista } from '../components/TarjetaLista';
import { useCartelera } from '../context/CarteleraContext';
import { colores, espacio } from '../theme/tema';
import {
  ESTADOS,
  ETIQUETA_ESTADO,
  TIPOS,
  type EstadoVisto,
  type ItemLista,
  type TipoMedio,
} from '../types/lista';
import type { TabsScreenProps } from '../types/navegacion';

type Filtro<T extends string> = T | 'todos';

const ETIQUETA_TIPO_PLURAL: Record<TipoMedio, string> = {
  movie: 'Películas',
  tv: 'Series',
};

export function MiListaScreen({ navigation }: TabsScreenProps<'MiLista'>) {
  const { lista } = useCartelera();
  const [filtroEstado, setFiltroEstado] = useState<Filtro<EstadoVisto>>('todos');
  const [filtroTipo, setFiltroTipo] = useState<Filtro<TipoMedio>>('todos');

  const filtrada = useMemo(
    () =>
      lista.filter(
        (i) =>
          (filtroEstado === 'todos' || i.estado === filtroEstado) &&
          (filtroTipo === 'todos' || i.tipo === filtroTipo),
      ),
    [lista, filtroEstado, filtroTipo],
  );

  const cantidadPorEstado = useMemo(() => {
    const conteo: Record<EstadoVisto, number> = { por_ver: 0, viendo: 0, vista: 0 };
    lista.forEach((i) => conteo[i.estado]++);
    return conteo;
  }, [lista]);

  const abrirEditor = useCallback(
    (item: ItemLista) => navigation.navigate('EditarEntrada', { itemId: item.id }),
    [navigation],
  );

  if (lista.length === 0) {
    return (
      <View style={styles.pantalla}>
        <MensajeVacio
          icono="bookmark-outline"
          titulo="Tu lista está vacía"
          descripcion="Busca una película o serie y agrégala a tu lista."
          accion={{ titulo: 'Ir a Buscar', onPress: () => navigation.navigate('Buscar') }}
        />
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.filtros}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filaChips}>
          <Chip etiqueta={`Todos (${lista.length})`} seleccionado={filtroEstado === 'todos'} onPress={() => setFiltroEstado('todos')} />
          {ESTADOS.map((e) => (
            <Chip
              key={e}
              etiqueta={`${ETIQUETA_ESTADO[e]} (${cantidadPorEstado[e]})`}
              seleccionado={filtroEstado === e}
              onPress={() => setFiltroEstado(e)}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filaChips}>
          <Chip etiqueta="Todo" seleccionado={filtroTipo === 'todos'} onPress={() => setFiltroTipo('todos')} />
          {TIPOS.map((t) => (
            <Chip
              key={t}
              etiqueta={ETIQUETA_TIPO_PLURAL[t]}
              seleccionado={filtroTipo === t}
              onPress={() => setFiltroTipo(t)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtrada}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <TarjetaLista item={item} onPress={abrirEditor} />}
        contentContainerStyle={[styles.lista, filtrada.length === 0 && styles.listaVacia]}
        ItemSeparatorComponent={Separador}
        ListEmptyComponent={
          <MensajeVacio icono="funnel-outline" titulo="Nada por aquí" descripcion="No hay obras con estos filtros." />
        }
      />
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
  filtros: {
    paddingVertical: espacio.md,
    gap: espacio.sm,
  },
  filaChips: {
    paddingHorizontal: espacio.lg,
    gap: espacio.sm,
  },
  lista: {
    paddingHorizontal: espacio.lg,
    paddingBottom: espacio.xl,
  },
  listaVacia: {
    flexGrow: 1,
  },
  separador: {
    height: espacio.sm,
  },
});
