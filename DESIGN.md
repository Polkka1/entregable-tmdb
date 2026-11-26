# DESIGN.md · Mi Cartelera Personal

Sistema de diseño de la app móvil. Léelo antes de crear o modificar cualquier archivo de
`src/screens/`, `src/components/`, `src/navigation/` o `src/tema/`.

- **De dónde sale:** `docs/diseno/BRIEF.md` (para quién es y cómo se siente) y
  `docs/diseno/brand-board.html` (las decisiones visuales). Este documento las escribe para el
  agente.
- **Fuente de verdad de los valores:** `src/tema/tema.ts`. Este documento explica las decisiones;
  el código guarda los valores. Si los dos no coinciden, gana el brand board y se corrige el otro.
- **Si algo no está aquí:** no lo inventes. Usa el componente o el token más cercano y anota el
  hueco en "Decisiones pendientes".
- **Quién lo cambia:** solo el estudiante. El agente propone cambios, pero no edita este archivo
  por su cuenta.

## 1. Principios

1. **La sala a oscuras.** Fondo casi negro, superficies apenas más claras y el póster como
   protagonista. Es el contexto en que se usa la app: de noche, después de ver algo.
2. **El color es una marquesina.** Poco color y donde importa: el acento violeta marca lo que se
   toca o está seleccionado; el dorado `celebracion` solo celebra (estrellas, obra destacada, mes
   más activo).
3. **Primero el orgullo, después los datos.** En *Mi año en cine* van arriba el total y la obra
   destacada, luego el mes más activo y al final las cifras.
4. **Lo que falta se explica con amabilidad.** Un dato ausente nunca se muestra como 0 ni deja
   un hueco: cada tarjeta dice qué falta y por qué.
5. **El estado se lee, no solo se ve.** *Por ver*, *Viendo* y *Vista* llevan siempre su color
   **y** su texto.
6. **Un toque, una acción.** Todo lo que se toca mide al menos 44 × 44.

## 2. Tokens

Se exportan desde `src/tema/tema.ts` como `colores`, `tipografia`, `espacio`, `colorEstado` y
`ALTURA_TOCABLE_MIN`. Ningún archivo fuera de `src/tema/` escribe un color en hexadecimal ni un
tamaño de letra suelto, y ninguna pantalla ni componente redondea esquinas (§2.4).

### 2.1 Colores

| Token | Valor | Uso |
|---|---|---|
| `colores.fondo` | `#0F1115` | Fondo de todas las pantallas |
| `colores.superficie` | `#1A1D24` | Tarjetas, barra de pestañas, encabezados |
| `colores.superficieAlta` | `#252932` | Botón secundario, avisos, elementos elevados, efecto al presionar |
| `colores.borde` | `#2F3440` | Bordes, separadores, barra de un mes en 0, estrellas vacías |
| `colores.texto` | `#F2F3F5` | Texto principal y cifras (17,0:1 sobre `fondo`) |
| `colores.textoSecundario` | `#A3A9B5` | Metadatos, rótulos, descripciones (6,2:1 sobre `superficieAlta`) |
| `colores.acento` | `#9D8CFF` | Botón primario, pestaña activa, chip seleccionado, barras por mes (5,3:1 sobre `superficieAlta`) |
| `colores.textoSobreAcento` | `#0F1115` | Texto e iconos sobre `acento` (6,9:1) |
| `colores.celebracion` | `#F5C542` | Estrellas, obra destacada, mes más activo, aviso de datos faltantes |
| `colores.textoSobreCelebracion` | `#1A1206` | Texto sobre `celebracion` (11,4:1) |
| `colores.estadoPorVer` | `#9DADC4` | Estado *Por ver* |
| `colores.estadoViendo` | `#4CC9F0` | Estado *Viendo* |
| `colores.estadoVista` | `#45D49B` | Estado *Vista* y confirmaciones ("En mi lista") |
| `colores.error` | `#FF6B6B` | Errores y botón de peligro (5,3:1 sobre `superficieAlta`) |
| `colores.tmdb1` · `tmdb2` · `tmdb3` | `#90CEA1` · `#3CBEC9` · `#00B3E5` | Solo el degradado oficial del logo de TMDB |

Reglas de color:
- Un texto sobre un color de estado o sobre `acento` usa `colores.fondo` / `textoSobreAcento`.
- `celebracion` no se usa para acciones ni para errores. `acento` no se usa para celebrar.
- `error` solo indica un error o una acción destructiva; nunca decora.
- Los mapas por estado se escriben como `Record<EstadoVisto, string>` con estos tres tokens.

### 2.2 Tipografía

Fuente del sistema; no se cargan fuentes. `tipografia.<nombre>` es un objeto con `fontSize`,
`lineHeight` y `fontWeight` que se aplica con el spread en `StyleSheet.create`.

| Token | Tamaño / interlínea / peso | Uso |
|---|---|---|
| `tipografia.display` | 40 / 48 / 800 | Total de obras del año |
| `tipografia.dato` | 32 / 38 / 700 | Valor numérico de una tarjeta de dato (con `fontVariant: ['tabular-nums']`) |
| `tipografia.titulo` | 24 / 30 / 700 | Título de pantalla, título de la obra destacada |
| `tipografia.subtitulo` | 18 / 24 / 600 | Título de sección o de tarjeta; valor de una tarjeta de dato cuando es un nombre |
| `tipografia.cuerpo` | 16 / 22 / 400 | Texto general; botones con peso 600 |
| `tipografia.secundario` | 14 / 20 / 400 | Metadatos y detalle |
| `tipografia.etiqueta` | 12 / 16 / 600 | Rótulos en mayúsculas, meses, insignias, pestañas |

### 2.3 Espacio

`espacio.xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 24 · `xxl` 32 · `xxxl` 48. El margen lateral de
toda pantalla es `lg`; la separación entre tarjetas, `md`.

### 2.4 Forma: esquinas rectas

**Ningún elemento tiene bordes redondeados** (decisión del estudiante, 2026-11-26): botones, chips,
tarjetas, pósteres, insignias, avisos, barras, la barra de progreso y los puntos de estado tienen
esquinas rectas. No hay token de radio, y ningún archivo de `src/screens/`, `src/components/` o
`src/navigation/` escribe `borderRadius` (lo vigila `src/tema/sinBordesRedondeados.test.ts`). La
forma se separa con bordes de 1 px y con el contraste entre `fondo`, `superficie` y
`superficieAlta`. Las únicas excepciones no son elementos propios de la app: el indicador de carga
nativo (`ActivityIndicator`), que el sistema dibuja circular, y el logo oficial de TMDB, que no se
modifica.

### 2.5 Toque

`ALTURA_TOCABLE_MIN = 44`. Botón: 48 (`ALTURA_TOCABLE_MIN + 4`). Chips, estrellas, pestañas y el
botón de borrar búsqueda: 44 × 44 como mínimo.

## 3. Componentes

Todos viven en `src/components/` y solo usan tokens de `src/tema/`. Antes de crear un componente
nuevo, revisa si uno de estos lo cubre.

### Del Proyecto 3 (se conservan, con la paleta nueva)

**`Boton`** · `variante: 'primario' | 'secundario' | 'peligro'`, `icono?`, `cargando?`,
`deshabilitado?`. Primario: fondo `acento` y texto `textoSobreAcento`. Secundario: fondo
`superficieAlta` con borde. Peligro: transparente, borde y texto `error`. Alto 48, esquinas rectas,
texto `cuerpo` 600.

**`Chip`** · opción de un solo valor (filtros, selector de estado, selector de año). Alto 44,
esquinas rectas. Normal: fondo `superficie` con borde. Seleccionado: fondo `acento` y texto
`textoSobreAcento`, o el color de su estado en el selector de estado.

**`SelectorEstado`** · tres `Chip` (*Por ver*, *Viendo*, *Vista*) con un punto del color de su
estado. El seleccionado se rellena con ese color y lleva texto `fondo`. Hoy está armado dentro de
`EditarEntradaScreen`; se extrae a un componente.

**`Estrellas`** · de 1 a 5, en `celebracion`; vacías en `borde`. Editable: cada estrella es un
tocable de 44 × 44; deshabilitada (estado distinto de *Vista*), opacidad 35 % y texto de ayuda.
Solo lectura: tamaño 14 a 18.

**`TarjetaObra`** (hoy `TarjetaLista`) · póster 64 × 96, título (`cuerpo` 600), meta
(`secundario`), insignia de estado (borde y texto del color del estado, con punto) y estrellas de
solo lectura si hay calificación. Fondo `superficie`, esquinas rectas.

**`TarjetaResultado`**, **`Poster`**, **`Icono`** (Ionicons de `@expo/vector-icons`) y
**`TmdbLogo`** se conservan. `TmdbLogo` toma sus colores de `colores.tmdb1` a `tmdb3`.

### De la épica Mi año en cine

**`TarjetaDato`** · `rotulo`, `valor`, `detalle?`, `falta?`. Fondo `superficie`, esquinas rectas,
padding `lg`. Rótulo en `etiqueta`, valor en `dato` (o `subtitulo` si es un nombre), detalle en
`secundario`. Si `falta` existe, va debajo, separado por un borde, en `secundario` con un ícono
de información.

**`BarrasPorMes`** · recibe los 12 valores y el índice del mes más activo. Se construye con `View`
(sin librerías de gráficas). Alto de cada barra proporcional al máximo; un mes en 0 deja una barra
de 2 px en `borde` y su "0". Barras en `acento`; el mes más activo, su número y su inicial en
`celebracion`. Encabezado: "Mes más activo" y "Julio · 8 obras". Cada columna se anuncia como
"julio: 8 obras".

**`TarjetaDestacada`** · póster 84 × 126 (96 × 144 si hay espacio), rótulo "Obra destacada" en
`celebracion`, título en `titulo`, estrellas y "Película · vista el 12 de marzo". Borde de 1 px en
`celebracion`. Variante vacía: borde discontinuo `borde`, el texto que invita a calificar y un
`Boton` secundario "Ir a Mi lista".

**`SelectorAnio`** · fila horizontal desplazable de `Chip`, del año más reciente al más antiguo.
El seleccionado en `acento`. Cada chip se anuncia como "Año 2025".

**`EstadosPantalla`** · se amplía el componente actual:
- `Cargando` · spinner `acento` y texto ("Preparando tu año…").
- `Progreso` · barra lineal (`borde` de fondo y `acento` de relleno) y "2 de 5 obras".
- `MensajeVacio` · ícono, título, descripción y `Boton` primario.
- `MensajeError` · ícono en `error`, título, mensaje y `Boton` secundario "Reintentar".

**`Aviso`** · reemplaza a `AvisoSinConexion`. Fondo `superficieAlta`, borde izquierdo de 4 px e
ícono del color del tipo: `acento` para sin conexión y `celebracion` para datos faltantes. Texto en
`secundario` con color `texto`. Va arriba del contenido; no lo reemplaza.

## 4. Pantallas

Toda pantalla usa `colores.fondo`, margen lateral `espacio.lg` y respeta el área segura. Los
encabezados de React Navigation usan `superficie` y `texto`.

- **Mi año en cine** (pestaña nueva "Mi año", entre Mi lista y Acerca de), de arriba abajo:
  título "Mi año en cine" · `SelectorAnio` · `Aviso` sin conexión (si aplica) · total en
  `display` con "31 películas · 11 series" · `TarjetaDestacada` · `BarrasPorMes` · cuadrícula de
  2 columnas con `TarjetaDato` (horas, obras, género, director) · `Aviso` de datos faltantes (si
  aplica). Mientras se completan datos se ve `Progreso` arriba de las tarjetas. Un año vacío
  reemplaza todo lo que va debajo del selector por `MensajeVacio` con "Ir a Mi lista".
- **Buscar, Detalle, Mi lista, Editar mi entrada, Acerca de y Login:** conservan su estructura
  del Proyecto 3 y pasan a los tokens de este documento (colores, tipografía, `Aviso`,
  `SelectorEstado`, `TarjetaObra`).
- **Acerca de:** el wordmark (isotipo con fondo `acento` y "Mi **Cartelera** Personal" en
  `titulo` o mayor) va arriba; `TmdbLogo` de 96 a 120 px de ancho va en la tarjeta de créditos,
  con el aviso obligatorio.

## 5. Voz y textos

- Español neutro, tuteo, cercano y entusiasta. Se celebra lo que hay antes de explicar lo que
  falta.
- Un error dice qué pasó y qué hacer. Sin "Error:", sin códigos y sin culpar al usuario.
- Los botones dicen la acción exacta: "Ir a Mi lista", "Reintentar", "Agregar a mi lista".
- Sin emojis ni signos de exclamación dobles.

| Situación | Texto |
|---|---|
| Año vacío (D12) | "Aún no hay obras vistas en {año}." · "Cuando marques una obra como vista, aparecerá en tu resumen." · [Ir a Mi lista] |
| Cargando | "Preparando tu año…" |
| Completando datos (D6) | "Completando datos" · "{n} de {total} obras" |
| Error | "No pudimos preparar tu resumen." · "Revisa tu conexión e inténtalo de nuevo." · [Reintentar] |
| Sin conexión (D13, PA-1) | "Sin conexión: estás viendo tu última copia guardada." + "{n} obras vistas aún no tienen fecha y se sumarán al reconectar." si aplica |
| Obras sin datos (D6) | "{n} obra(s) quedó/quedaron sin datos de TMDB: cuenta(n) en el total, pero no en horas, géneros ni directores." |
| Películas sin duración (D7) | "{n} película(s) sin duración no suma(n) horas." |
| Sin director (D9) | "Aún no hay datos suficientes para elegir un director." |
| Sin calificaciones (D11) | "Califica las obras que viste para elegir tu destacada del año." · [Ir a Mi lista] |

Los plurales se resuelven en una función, no con "(s)" en pantalla.

## 6. Accesibilidad

- Contraste mínimo de 4,5:1 para todo texto; los tokens ya lo cumplen (el menor es 5,25:1).
- Todo tocable mide al menos 44 × 44, tiene `accessibilityRole` y una etiqueta que se entiende sin
  ver la pantalla ("Año 2025", "3 de 5 estrellas").
- Las barras se anuncian una por una ("julio: 8 obras"); el gráfico completo tiene una etiqueta
  que resume el mes más activo.
- El estado, el error y la selección se comunican con texto o con `accessibilityState`, no solo
  con color.
- Los textos usan el escalado de fuente del sistema: ninguna tarjeta corta un número con
  `numberOfLines` y las cuadrículas pasan a una columna si no caben.

## 7. Sí y no

| Sí | No |
|---|---|
| `colores.error` desde `src/tema/` | `'#ff6b6b'` escrito en una pantalla |
| `...tipografia.dato` en el estilo | `fontSize: 32` suelto |
| Barras hechas con `View` y alto proporcional | Una librería de gráficas |
| Una insignia con punto **y** texto "Vista" | Un punto verde sin texto |
| "Aún no hay datos suficientes para elegir un director." | Una tarjeta con "—" o con 0 |
| `celebracion` en la obra destacada | `celebracion` en un botón |
| Esquinas rectas, separadas por bordes de 1 px | `borderRadius` en cualquier pantalla o componente |
| Reutilizar `Boton`, `Chip` y `TarjetaDato` | Un `Pressable` con estilos nuevos en cada pantalla |
| El logo de TMDB en Acerca de, más pequeño que el wordmark | El logo de TMDB en *Mi año en cine* o más grande que la marca |

## 8. Decisiones pendientes

- **Ícono de la pestaña "Mi año":** propuesta `calendar` / `calendar-outline` de Ionicons.
- **`TarjetaResultado`:** no aparece en el brand board; mientras tanto sigue el estilo de
  `TarjetaObra` sin insignia de estado.
- **Modo claro:** fuera de alcance.
- **Animaciones** (crecimiento de las barras, transición entre años): fuera de alcance de esta
  épica.
