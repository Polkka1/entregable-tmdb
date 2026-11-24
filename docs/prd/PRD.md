# PRD · Mi Cartelera Personal

**Producto:** app móvil (Expo SDK 58 + React Native + TypeScript) para llevar una lista personal de
películas y series obtenidas de TMDB.
**Curso:** DIM 4080 Tecnologías Emergentes (USFQ).
**Versión del documento:** 1.0, línea base. Fecha: 2026-11-24.

> **Fuente de la línea base.** Las secciones 1 a 6 transcriben el enunciado del *Entregable 2 · Mi
> Cartelera Personal*, que el Entregable 3 llama "Proyecto 3", y su rúbrica. El código de esa
> entrega está marcado con la etiqueta `p3-final`. Este documento es la referencia de la
> auditoría inicial (`docs/AUDITORIA.md`). La sección 7 se completa en el Hito 2 con la épica
> *Mi año en cine*.

## 1. Problema y objetivo

Cada usuario busca películas y series en TMDB, las agrega a su lista personal y las organiza por
estado (*por ver*, *viendo*, *vista*), con una calificación y un comentario propios. La lista es
privada: nadie más puede verla ni modificarla.

**Objetivo:** una app móvil que combine autenticación con Firebase Auth, datos propios en
Firestore y una API externa pública, escrita en TypeScript y ejecutable en un dispositivo con Expo.

## 2. Usuarios

Una persona con una cuenta propia (correo y contraseña) que usa la app en su teléfono con Expo Go.

## 3. Requisitos funcionales

| Id | Requisito | Criterio de aceptación (enunciado) | Qué agrega la rúbrica para "Excelente" | Dónde vive en el código |
|---|---|---|---|---|
| RF1 | Registro, inicio y cierre de sesión con Firebase Auth | La sesión persiste al cerrar y reabrir la app; los errores de Firebase se muestran traducidos | Navegación condicional correcta; formulario con validación y alternancia entre los dos modos (1.5) | `services/authService.ts`, `services/firebase.ts`, `context/SesionContext.tsx`, `screens/LoginScreen.tsx`, `navigation/RootNavigator.tsx` |
| RF2 | Búsqueda de películas y series por título (TMDB) | Muestra carátula, título y año; maneja carga, error y sin resultados | Imagen de relleno sin póster; paginación (1.8); servicio tipado | `services/tmdbService.ts` (`buscar`), `hooks/useBusqueda.ts`, `screens/BuscarScreen.tsx`, `components/TarjetaResultado.tsx` |
| RF3 | Detalle de una obra | Muestra póster, sinopsis, calificación de TMDB y elenco; funciona si falta el póster o la sinopsis | Elenco en la misma petición (`append_to_response`); carga, error y vacío; URL de imagen con `/configuration` | `services/tmdbService.ts` (`obtenerDetalle`, `construirUrlImagen`), `screens/DetalleScreen.tsx`, `components/Poster.tsx` |
| RF4 | Agregar a Mi lista | Crea el documento con estado inicial; no permite duplicados | `itemId = tipo_tmdbId`; cambios visibles al instante | `services/listaService.ts` (`agregarItem`), `utils/lista.ts` (`crearItemId`), `context/CarteleraContext.tsx` (`agregar`) |
| RF5 | Ver Mi lista por estado | Filtro por *Por ver* / *Viendo* / *Vista* y por tipo (película o serie) | Tarjetas con la calificación personal (1.5) | `screens/MiListaScreen.tsx`, `components/TarjetaLista.tsx`, `services/listaService.ts` (`obtenerLista`) |
| RF6 | Editar mi entrada | Cambiar estado, calificación (1 a 5) y comentario (hasta 500 caracteres); **solo se califica si el estado es *vista*** | La regla se cumple también en el servidor (1.9) | `utils/lista.ts` (`normalizarCambios`), `screens/EditarEntradaScreen.tsx`, `components/Estrellas.tsx`, `services/listaService.ts` (`actualizarItem`), `firestore.rules` |
| RF7 | Quitar de Mi lista | Pide confirmación antes de borrar | — | `screens/EditarEntradaScreen.tsx` (`confirmarQuitar`), `services/listaService.ts` (`eliminarItem`) |
| RF8 | Persistencia y modo sin conexión | La lista se guarda en Firestore y hay una copia en AsyncStorage; sin internet se muestra la última copia con un aviso | Tiempo máximo en las escrituras para no quedar esperando sin conexión (paso 9) | `services/cacheService.ts`, `context/CarteleraContext.tsx`, `components/AvisoSinConexion.tsx` |
| RF9 | Pantalla Acerca de / Créditos | Incluye la atribución y el logo de TMDB, y el cierre de sesión | El logo y el aviso obligatorio están visibles; **el logo de TMDB es menos prominente que la marca de la app** | `screens/AcercaDeScreen.tsx`, `components/TmdbLogo.tsx` |
| RF10 | Código en TypeScript y por capas | Sin `any` innecesarios; servicios separados de las pantallas; claves fuera del repositorio | Interfaces y tipo unión `EstadoVisto`; `Record` exhaustivo o `switch` con `never`; `EstadoPeticion<T>` | `types/`, `services/`, `utils/assertNever.ts`, `.gitignore`, `.env.example` |

## 4. Seguridad: reglas de Firestore (enunciado 1.9)

| Id | Requisito | Criterio |
|---|---|---|
| SEG1 | Cada usuario solo puede leer y modificar su propia lista | `request.auth.uid == uid` en `usuarios/{uid}` y en `mi_lista/{itemId}`. Probado con dos cuentas: la cuenta B no puede leer ni modificar la lista de la cuenta A |
| SEG2 | Los datos cumplen las reglas de negocio también en el servidor | `esItemValido`: estado, tipo, `tmdbId` entero, título de 1 a 200 caracteres, comentario de hasta 500 y calificación nula o de 1 a 5 |
| SEG3 | Las reglas están publicadas y hay una copia en el repositorio | `firestore.rules` y las capturas del Rules Playground en `docs/` |

## 5. Restricciones y requisitos no funcionales (enunciado 1.11)

| Id | Requisito |
|---|---|
| RNF1 | `.env` no está en el repositorio; `.env.example` existe sin valores reales. |
| RNF2 | Las pantallas no llaman directamente a Firebase ni a TMDB: usan la capa `services/`. |
| RNF3 | Se evita `any`; si es indispensable, se justifica con un comentario. |
| RNF4 | Toda petición maneja los tres estados: cargando, error y éxito (`EstadoPeticion<T>`). |
| RNF5 | Las acciones destructivas (quitar de la lista) piden confirmación. |
| RNF6 | Los elementos tocables miden al menos 44 px de alto. |
| RNF7 | El uso de IA se declara en la bitácora, y todo el código se puede explicar. |
| RNF8 | Uso no comercial de TMDB: atribución, logo y aviso "This product uses the TMDB API but is not endorsed or certified by TMDB". |
| RNF9 | Se ejecuta en Expo Go, en un dispositivo físico o un emulador. |

## 6. Pantallas, arquitectura y modelo de datos (enunciado 1.5 a 1.7)

**Pantallas:**
- Login / Registro: solo sin sesión.
- Pestañas: Buscar, Mi lista y Acerca de.
- Pila: Detalle de TMDB, con el botón *Agregar a mi lista*, y Editar mi entrada (selector de
  estado, calificación, comentario y *Quitar*; pantalla de la pila o modal).

**Capas:**
- Interfaz: React Native + Expo.
- Navegación: React Navigation, con pila y pestañas.
- Estado global: Context API.
- Servicios: `services/`, único lugar que llama a Firebase y a TMDB.
- Datos: Firebase Auth, Firestore y TMDB.
- Caché: AsyncStorage.

**Estructura sugerida en el enunciado:** `firebase/config.ts`, `services/`,
`context/CarteleraContext.tsx`, `types/`, `screens/` y `components/` (TarjetaObra,
SelectorEstado, Estrellas…).

**Modelo:** `usuarios/{uid}/mi_lista/{itemId}`, con `itemId = ${tipo}_${tmdbId}`. Campos:

| Campo | Tipo | Descripción |
|---|---|---|
| `tmdbId` | número | Id de la obra en TMDB |
| `tipo` | `'movie'` \| `'tv'` | Película o serie |
| `titulo` | texto | Copiado de TMDB al agregar |
| `anio` | texto | Año de estreno o primera emisión |
| `posterPath` | texto o nulo | Solo la ruta; la URL se arma al mostrarla |
| `estado` | `'por_ver'` \| `'viendo'` \| `'vista'` | Estado de visionado |
| `calificacionPersonal` | número o nulo | De 1 a 5; solo si el estado es *vista* |
| `comentario` | texto | Hasta 500 caracteres |
| `agregadoEn` / `actualizadoEn` | marca de tiempo | `serverTimestamp()` |

**Tipos mínimos:** `EstadoVisto`, `TipoMedio`, `ItemLista`, `EstadoPeticion<T>` y
`ETIQUETA_ESTADO: Record<EstadoVisto, string>`.

## 7. Épica: Mi año en cine

*Pendiente para el Hito 2: descripción de la épica, cambios al modelo de datos y reglas de
negocio D1 a D13.*

### 7.1 Reglas de negocio

*Pendiente (Hito 2).*

### 7.2 Puntos abiertos

*Pendiente (Hito 2).*
