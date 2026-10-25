import Constants from 'expo-constants';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../components/Boton';
import { Icono } from '../components/Icono';
import { TmdbLogo } from '../components/TmdbLogo';
import { useSesion } from '../context/SesionContext';
import { colores, espacio, radio } from '../theme/tema';
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
        <Icono name="film" size={64} color={colores.acento} />
        <Text style={styles.nombreApp} accessibilityRole="header">
          Mi Cartelera Personal
        </Text>
        <Text style={styles.version}>Versión {version}</Text>
      </View>

      <Text style={styles.parrafo}>
        Busca películas y series, agrégalas a tu lista personal y organízalas por estado: por ver, viendo o
        vista. Califica y comenta lo que ya viste. Tu lista es privada.
      </Text>

      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo} accessibilityRole="header">
          Datos y créditos
        </Text>
        <TmdbLogo ancho={120} />
        <Text style={styles.aviso}>{AVISO_TMDB}</Text>
        <Text style={styles.parrafoSecundario}>
          Los datos de películas y series, las imágenes y el elenco provienen de The Movie Database (TMDB). Esta
          app es un proyecto académico sin fines comerciales.
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
  nombreApp: {
    color: colores.texto,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  version: {
    color: colores.textoSecundario,
    fontSize: 14,
  },
  parrafo: {
    color: colores.texto,
    fontSize: 15,
    lineHeight: 22,
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
    fontSize: 17,
    fontWeight: '600',
  },
  aviso: {
    color: colores.texto,
    fontSize: 14,
    fontStyle: 'italic',
  },
  parrafoSecundario: {
    color: colores.textoSecundario,
    fontSize: 14,
    lineHeight: 20,
  },
});
