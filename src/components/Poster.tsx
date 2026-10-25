import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { construirUrlImagen } from '../services/tmdbService';
import { colores, radio } from '../theme/tema';
import type { UsoImagen } from '../types/tmdb';
import { Icono, type NombreIcono } from './Icono';

interface Props {
  path: string | null;
  uso: UsoImagen;
  ancho: number;
  /** Por defecto proporción 2:3 de los pósteres */
  alto?: number;
  /** Texto para lectores de pantalla */
  descripcion: string;
}

/** Imagen de TMDB con relleno cuando no hay póster o no se pudo descargar. */
export function Poster({ path, uso, ancho, alto = Math.round(ancho * 1.5), descripcion }: Props) {
  const [fallo, setFallo] = useState(false);
  const url = construirUrlImagen(path, uso);
  const dimensiones = { width: ancho, height: alto };

  if (!url || fallo) {
    const icono: NombreIcono = uso === 'perfil' ? 'person' : 'film-outline';
    return (
      <View
        style={[styles.relleno, dimensiones]}
        accessible
        accessibilityLabel={`${descripcion} (sin imagen)`}
      >
        <Icono name={icono} size={Math.round(ancho * 0.4)} color={colores.textoSecundario} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      style={[styles.imagen, dimensiones]}
      contentFit="cover"
      transition={150}
      recyclingKey={url}
      accessibilityLabel={descripcion}
      onError={() => setFallo(true)}
    />
  );
}

const styles = StyleSheet.create({
  imagen: {
    borderRadius: radio.sm,
    backgroundColor: colores.superficieAlta,
  },
  relleno: {
    borderRadius: radio.sm,
    backgroundColor: colores.superficieAlta,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
