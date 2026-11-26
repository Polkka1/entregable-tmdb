import Constants from 'expo-constants';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../components/Boton';
import { Icono } from '../components/Icono';
import { TmdbLogo } from '../components/TmdbLogo';
import { useSesion } from '../context/SesionContext';
import { colores, espacio, radio, tipografia } from '../tema/tema';
import { mensajeDeError } from '../utils/errores';

const AVISO_TMDB = 'This product uses the TMDB API but is not endorsed or certified by TMDB.';
const URL_TMDB = 'https://www.themoviedb.org/';

export function AcercaDeScreen() {
  const version = Constants.expoConfig?.version ?? '—';
  const { usuario, cerrarSesion } = useSesion();
  const [saliendo, setSaliendo] = useState(false);

  const confirmarCierre = () => {
    Alert.alert('Cerrar sesión', '¿Quieres cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          setSaliendo(true);
          try {
            // Al cerrar sesión la navegación vuelve sola a Login.
            await cerrarSesion();
          } catch (error) {
            setSaliendo(false);
            Alert.alert('No se pudo cerrar sesión', mensajeDeError(error));
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      {/* Marca de la app: debe ser más prominente que el logo de TMDB */}
      <View style={styles.marca}>
        {/* Wordmark (DESIGN.md §4): isotipo con fondo acento y "Cartelera" en el color de acento */}
        <View style={styles.isotipo}>
          <Icono name="film" size={36} color={colores.textoSobreAcento} />
        </View>
        <Text style={styles.nombreApp} accessibilityRole="header" accessibilityLabel="Mi Cartelera Personal">
          Mi <Text style={styles.nombreAcento}>Cartelera</Text> Personal
        </Text>
        <Text style={styles.version}>Versión {version}</Text>
      </View>

      <Text style={styles.parrafo}>
        Busca películas y series, agrégalas a tu lista personal y organízalas por estado: por ver, viendo o vista.
        Califica y comenta lo que ya viste. Tu lista es privada.
      </Text>

      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo} accessibilityRole="header">
          Datos y créditos
        </Text>
        <TmdbLogo ancho={96} />
        <Text style={styles.aviso}>{AVISO_TMDB}</Text>
        <Text style={styles.parrafoSecundario}>
          Los datos de películas y series, las imágenes y el elenco provienen de The Movie Database (TMDB). Esta app es
          un proyecto académico sin fines comerciales.
        </Text>
        <Boton
          titulo="Visitar themoviedb.org"
          icono="open-outline"
          variante="secundario"
          onPress={() => Linking.openURL(URL_TMDB)}
        />
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo} accessibilityRole="header">
          Proyecto
        </Text>
        <Text style={styles.parrafoSecundario}>DIM 4080 Tecnologías Emergentes · USFQ</Text>
        <Text style={styles.parrafoSecundario}>React Native + Expo · TypeScript · Firebase · TMDB</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo} accessibilityRole="header">
          Mi cuenta
        </Text>
        <Text style={styles.parrafoSecundario}>{usuario?.email ?? 'Sin correo'}</Text>
        <Boton
          titulo="Cerrar sesión"
          icono="log-out-outline"
          variante="peligro"
          cargando={saliendo}
          onPress={confirmarCierre}
        />
      </View>
    </ScrollView>
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
    paddingBottom: espacio.xxl,
  },
  marca: {
    alignItems: 'center',
    gap: espacio.sm,
    paddingTop: espacio.lg,
  },
  isotipo: {
    width: 64,
    height: 64,
    borderRadius: radio.lg,
    backgroundColor: colores.acento,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombreAcento: {
    color: colores.acento,
  },
  nombreApp: {
    color: colores.texto,
    ...tipografia.titulo,
    fontWeight: '800',
    textAlign: 'center',
  },
  version: {
    color: colores.textoSecundario,
    ...tipografia.secundario,
  },
  parrafo: {
    color: colores.texto,
    ...tipografia.cuerpo,
    textAlign: 'center',
  },
  tarjeta: {
    gap: espacio.md,
    padding: espacio.lg,
    borderRadius: radio.lg,
    backgroundColor: colores.superficie,
  },
  subtitulo: {
    color: colores.texto,
    ...tipografia.subtitulo,
    fontWeight: '600',
  },
  aviso: {
    color: colores.texto,
    ...tipografia.secundario,
    fontStyle: 'italic',
  },
  parrafoSecundario: {
    color: colores.textoSecundario,
    ...tipografia.secundario,
  },
});
