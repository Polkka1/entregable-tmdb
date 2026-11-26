// Datos de prueba para verificar Mi año en cine (docs/VERIFICACION.md §0).
//
// Uso, en la raíz del proyecto:
//   node --env-file=.env scripts/sembrarDatosPrueba.mjs                    crea las obras
//   node --env-file=.env scripts/sembrarDatosPrueba.mjs --solo-anteriores  sin el grupo "anterior a la épica"
//   node --env-file=.env scripts/sembrarDatosPrueba.mjs --borrar           borra solo las obras de este script
//
// Pide el correo y la contraseña en la terminal; no los guarda. Escribe con las mismas reglas
// publicadas que la app: crea cada obra en 'por_ver' y después la marca como vista con su fecha.

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  Timestamp,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore/lite';
import readline from 'node:readline';

// ---------------------------------------------------------------------------
// Conjunto de obras (VERIFICACION.md §0). Mes de 1 a 12, en la hora local de esta máquina.
// grupo: 'conDatos' guarda géneros, duración y directores; 'sinDatos' no los guarda (D6);
// 'antesDeLaEpica' queda vista sin vistaEn ni datos (D2); 'control' no se marca como vista.
// ---------------------------------------------------------------------------
const OBRAS = [
  // 2025, con datos
  { tipo: 'movie', id: 27205, grupo: 'conDatos', vista: [2025, 3, 14, 21, 0], calificacion: 5 }, // Origen
  { tipo: 'movie', id: 157336, grupo: 'conDatos', vista: [2025, 7, 5, 20, 0], calificacion: 5 }, // Interstellar
  { tipo: 'movie', id: 155, grupo: 'conDatos', vista: [2025, 7, 19, 22, 0], calificacion: 4 }, // El caballero oscuro
  { tipo: 'movie', id: 496243, grupo: 'conDatos', vista: [2025, 10, 2, 21, 30], calificacion: 4 }, // Parásitos
  { tipo: 'tv', id: 1396, grupo: 'conDatos', vista: [2025, 7, 28, 23, 0], calificacion: 5 }, // Breaking Bad
  { tipo: 'movie', id: 680, grupo: 'conDatos', vista: [2025, 12, 31, 23, 30], calificacion: 4 }, // Pulp Fiction (D3)
  // 2025, sin datos (D6)
  { tipo: 'movie', id: 550, grupo: 'sinDatos', vista: [2025, 2, 8, 22, 0], calificacion: 3 }, // El club de la lucha
  { tipo: 'tv', id: 66732, grupo: 'sinDatos', vista: [2025, 11, 1, 19, 0], calificacion: null }, // Stranger Things
  // 2024, con datos
  { tipo: 'movie', id: 438631, grupo: 'conDatos', vista: [2024, 3, 2, 20, 0], calificacion: 5 }, // Dune
  { tipo: 'movie', id: 129, grupo: 'conDatos', vista: [2024, 8, 10, 18, 0], calificacion: 5 }, // El viaje de Chihiro
  { tipo: 'movie', id: 13, grupo: 'conDatos', vista: [2024, 8, 24, 21, 0], calificacion: 4 }, // Forrest Gump
  { tipo: 'tv', id: 1399, grupo: 'conDatos', vista: [2024, 12, 15, 22, 0], calificacion: 3 }, // Juego de tronos
  // Anterior a la épica (D2): vista, sin vistaEn ni datos
  { tipo: 'movie', id: 872585, grupo: 'antesDeLaEpica', vista: null, calificacion: 5 }, // Oppenheimer
  // Control: no cuentan en ningún resumen
  { tipo: 'movie', id: 346698, grupo: 'control', estado: 'por_ver' }, // Barbie
  { tipo: 'tv', id: 95396, grupo: 'control', estado: 'viendo' }, // Severance
];

const MAX_ELEMENTOS = 10;
/** Marca las obras de este script: --borrar solo elimina las que la tienen. */
const MARCA = 'Dato de prueba';

// ---------------------------------------------------------------------------
// Utilidades de terminal
// ---------------------------------------------------------------------------
function preguntar(texto, { oculto = false } = {}) {
  return new Promise((resolver) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (oculto) {
      // No muestra la contraseña mientras se escribe.
      rl._writeToOutput = (s) => {
        if (s.includes(texto)) process.stdout.write(s);
      };
    }
    rl.question(texto, (respuesta) => {
      rl.close();
      if (oculto) process.stdout.write('\n');
      resolver(respuesta.trim());
    });
  });
}

function exigirVariable(nombre) {
  const valor = process.env[nombre];
  if (!valor) {
    console.error(`Falta ${nombre}. Ejecuta el script con: node --env-file=.env scripts/sembrarDatosPrueba.mjs`);
    process.exit(1);
  }
  return valor;
}

// ---------------------------------------------------------------------------
// TMDB
// ---------------------------------------------------------------------------
async function detalleTmdb(tipo, id, token) {
  const url = `https://api.themoviedb.org/3/${tipo}/${id}?language=es-ES&append_to_response=credits`;
  const respuesta = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  if (!respuesta.ok) throw new Error(`TMDB respondió ${respuesta.status} para ${tipo}/${id}`);
  const d = await respuesta.json();
  const fecha = tipo === 'movie' ? d.release_date : d.first_air_date;
  const unicos = (lista) => [...new Set(lista.map((v) => v.trim()).filter(Boolean))].slice(0, MAX_ELEMENTOS);
  const runtime = Number.isInteger(d.runtime) && d.runtime >= 1 && d.runtime <= 1000 ? d.runtime : null;
  return {
    titulo: (tipo === 'movie' ? d.title : d.name).slice(0, 200),
    anio: fecha ? fecha.slice(0, 4) : '',
    posterPath: d.poster_path ?? null,
    // Igual que datosParaGuardar (src/dominio/datosTmdb.ts): series sin duración ni directores.
    datos: {
      generos: unicos((d.genres ?? []).map((g) => g.name)),
      duracionMin: tipo === 'movie' ? runtime : null,
      directores:
        tipo === 'movie' ? unicos((d.credits?.crew ?? []).filter((m) => m.job === 'Director').map((m) => m.name)) : [],
    },
  };
}

// ---------------------------------------------------------------------------
// Programa
// ---------------------------------------------------------------------------
const borrar = process.argv.includes('--borrar');
const soloAnteriores = process.argv.includes('--solo-anteriores');

const app = initializeApp({
  apiKey: exigirVariable('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: exigirVariable('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: exigirVariable('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: exigirVariable('EXPO_PUBLIC_FIREBASE_APP_ID'),
});
const tokenTmdb = borrar ? '' : exigirVariable('EXPO_PUBLIC_TMDB_TOKEN');

const correo = await preguntar('Correo de la cuenta: ');
const contrasena = await preguntar('Contraseña: ', { oculto: true });

let uid;
try {
  ({
    user: { uid },
  } = await signInWithEmailAndPassword(getAuth(app), correo, contrasena));
} catch (error) {
  console.error(`No se pudo iniciar sesión: ${error.code ?? error.message}`);
  process.exit(1);
}
const db = getFirestore(app);
console.log(`Sesión iniciada. Lista: usuarios/${uid}/mi_lista\n`);

const obras = soloAnteriores ? OBRAS.filter((o) => o.grupo !== 'antesDeLaEpica') : OBRAS;
let hechas = 0;

for (const obra of obras) {
  const itemId = `${obra.tipo}_${obra.id}`;
  const ref = doc(db, 'usuarios', uid, 'mi_lista', itemId);
  try {
    if (borrar) {
      const actual = await getDoc(ref);
      if (actual.exists() && actual.data().comentario === MARCA) {
        await deleteDoc(ref);
        console.log(`  borrada   ${itemId}`);
        hechas++;
      }
      continue;
    }

    if ((await getDoc(ref)).exists()) {
      console.log(`  ya existe ${itemId}: no se toca`);
      continue;
    }

    const { titulo, anio, posterPath, datos } = await detalleTmdb(obra.tipo, obra.id, tokenTmdb);

    // 1) Crear como lo hace la app: por_ver, sin vistaEn y con marcas del servidor.
    await setDoc(ref, {
      tmdbId: obra.id,
      tipo: obra.tipo,
      titulo,
      anio,
      posterPath,
      estado: 'por_ver',
      calificacionPersonal: null,
      comentario: MARCA,
      ...(obra.grupo === 'conDatos' || obra.grupo === 'control' ? datos : {}),
      agregadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });

    // 2) Marcar el estado final.
    if (obra.grupo === 'control') {
      if (obra.estado !== 'por_ver') {
        await updateDoc(ref, { estado: obra.estado, actualizadoEn: serverTimestamp() });
      }
    } else {
      const cambios = { estado: 'vista', calificacionPersonal: obra.calificacion, actualizadoEn: serverTimestamp() };
      if (obra.vista) {
        const [a, m, d, h, min] = obra.vista;
        cambios.vistaEn = Timestamp.fromDate(new Date(a, m - 1, d, h, min));
      }
      await updateDoc(ref, cambios);
    }

    const cuando = obra.vista
      ? obra.vista.slice(0, 3).reverse().join('/')
      : obra.grupo === 'control'
        ? obra.estado
        : 'sin fecha';
    console.log(`  creada    ${itemId.padEnd(13)} ${titulo} · ${obra.grupo} · ${cuando}`);
    hechas++;
  } catch (error) {
    console.error(`  ERROR     ${itemId}: ${error.code ?? error.message}`);
  }
}

console.log(`\n${borrar ? 'Borradas' : 'Creadas'}: ${hechas} de ${obras.length}.`);
process.exit(0);
