import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Aviso } from '../components/Aviso';
import { AvisoSinConexion } from '../components/AvisoSinConexion';
import { BarrasPorMes } from '../components/BarrasPorMes';
import { Cargando, MensajeError, MensajeVacio, Progreso } from '../components/EstadosPantalla';
import { SelectorAnio } from '../components/SelectorAnio';
import { TarjetaDato } from '../components/TarjetaDato';
import { TarjetaDestacada } from '../components/TarjetaDestacada';
import type { ResumenAnual } from '../dominio/resumenAnual';
import { useResumenAnual } from '../hooks/useResumenAnual';
import { colores, espacio, tipografia } from '../tema/tema';
import type { TabsScreenProps } from '../types/navegacion';
import { assertNever } from '../utils/assertNever';
import { avisoSinDatos, avisoSinDuracion, contar, detalleTipos, textoHoras, tituloVacio } from '../utils/textosResumen';

// Mi año en cine (spec 01 §8, spec 02 §3, DESIGN.md §4). La pantalla no calcula ninguna regla:
// el resumen sale de src/dominio/ a través de useResumenAnual.

export function MiAnioScreen({ navigation }: TabsScreenProps<'MiAnio'>) {
  // D4: el selector abre en el año actual.
  const [anio, setAnio] = useState(() => new Date().getFullYear());
  const { anios, resumen, preparacion, reintentar, progreso, sinConexion, sinFecha } = useResumenAnual(anio);
  const irAMiLista = () => navigation.navigate('MiLista');

  const renderContenido = () => {
    switch (preparacion.tipo) {
      case 'cargando':
        return <Cargando texto="Preparando tu año…" />;
      case 'error':
        return (
          <MensajeError
            titulo="No pudimos preparar tu resumen."
            mensaje={preparacion.mensaje}
            onReintentar={reintentar}
          />
        );
      case 'exito':
        // D12: un año sin obras vistas muestra el estado vacío, no tarjetas en cero.
        if (resumen.totalObras === 0) {
          return (
            <MensajeVacio
              icono="calendar-outline"
              titulo={tituloVacio(anio)}
              descripcion="Cuando marques una obra como vista, aparecerá en tu resumen."
              accion={{ titulo: 'Ir a Mi lista', onPress: irAMiLista }}
            />
          );
        }
        return <Resumen resumen={resumen} onIrAMiLista={irAMiLista} progreso={progreso} />;
      default:
        return assertNever(preparacion);
    }
  };

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <SelectorAnio anios={anios} seleccionado={anio} onCambiar={setAnio} />
      {sinConexion && <AvisoSinConexion sinFecha={sinFecha} />}
      {renderContenido()}
    </ScrollView>
  );
}

interface PropsResumen {
  resumen: ResumenAnual;
  progreso: { hechas: number; total: number } | null;
  onIrAMiLista: () => void;
}

function Resumen({ resumen, progreso, onIrAMiLista }: PropsResumen) {
  const { generoTop, directorTop } = resumen;
  const faltanDatos = avisoSinDatos(resumen.obrasSinDatos);
  return (
    <View style={styles.resumen}>
      {progreso && <Progreso hechas={progreso.hechas} total={progreso.total} />}

      <View
        accessible
        accessibilityLabel={`${contar(resumen.totalObras, 'obra vista', 'obras vistas')}: ${detalleTipos(resumen.peliculas, resumen.series)}`}
      >
        <Text style={styles.total}>{contar(resumen.totalObras, 'obra', 'obras')}</Text>
        <Text style={styles.detalleTotal}>{detalleTipos(resumen.peliculas, resumen.series)}</Text>
      </View>

      <TarjetaDestacada obra={resumen.destacada} onIrAMiLista={onIrAMiLista} />

      <BarrasPorMes obrasPorMes={resumen.obrasPorMes} mesTop={resumen.mesTop} />

      <View style={styles.fila}>
        <TarjetaDato
          rotulo="Horas de cine"
          valor={textoHoras(resumen.horas)}
          detalle={`en ${contar(resumen.peliculas, 'película', 'películas')}`}
          falta={avisoSinDuracion(resumen.peliculasSinDuracion)}
        />
        <TarjetaDato
          rotulo="Obras"
          valor={String(resumen.totalObras)}
          detalle={detalleTipos(resumen.peliculas, resumen.series)}
        />
      </View>
      <View style={styles.fila}>
        <TarjetaDato
          rotulo="Género"
          valorEsNombre
          valor={generoTop?.nombre ?? 'Aún no hay datos suficientes'}
          detalle={generoTop ? contar(generoTop.obras, 'obra', 'obras') : 'Ninguna obra del año tiene género.'}
        />
        <TarjetaDato
          rotulo="Director"
          valorEsNombre
          valor={directorTop?.nombre ?? 'Aún no hay datos suficientes'}
          detalle={
            directorTop
              ? contar(directorTop.obras, 'película', 'películas')
              : 'Ninguna película del año tiene director.'
          }
        />
      </View>

      {faltanDatos && <Aviso tipo="datosFaltantes" texto={faltanDatos} />}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    flexGrow: 1,
    padding: espacio.lg,
    gap: espacio.md,
    paddingBottom: espacio.xxl,
  },
  resumen: {
    gap: espacio.md,
  },
  total: {
    ...tipografia.display,
    color: colores.texto,
    fontVariant: ['tabular-nums'],
  },
  detalleTotal: {
    ...tipografia.secundario,
    color: colores.textoSecundario,
  },
  fila: {
    flexDirection: 'row',
    gap: espacio.md,
  },
});
