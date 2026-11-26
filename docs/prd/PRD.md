# PRD · Mi Cartelera Personal

**Producto:** app móvil (Expo SDK 58 + React Native + TypeScript) para llevar una lista personal de
películas y series obtenidas de TMDB.
**Curso:** DIM 4080 Tecnologías Emergentes (USFQ).
**Versión del documento:** 1.1. Línea base (2026-11-24) y épica *Mi año en cine* (2026-11-25).

> **Fuente de la línea base.** Las secciones 1 a 6 transcriben el enunciado del *Entregable 2 · Mi
> Cartelera Personal*, que el Entregable 3 llama "Proyecto 3", y su rúbrica. El código de esa
> entrega está marcado con la etiqueta `p3-final`. Este documento es la referencia de la
> auditoría inicial (`docs/AUDITORIA.md`). La sección 7 agrega la épica
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

> **Fuente:** el enunciado del *Entregable 3 · Mi año en cine* (secciones 1.3 a 1.6). Las
> decisiones D1 a D13 son del cliente (el docente) y no se cambian. Un caso que estas reglas no
> cubren se anota en la sección 7.5 y se consulta.

### 7.1 Objetivo

Una pantalla nueva, **Mi año en cine**, en su propia pestaña. Ahí el usuario ve el resumen de lo
que vio en un año:

- las obras vistas en el año, con cuántas son películas y cuántas series;
- las horas de cine (solo películas);
- el género y el director más vistos;
- el mes más activo, con una barra por mes;
- la obra destacada, que es la mejor calificada del año;
- un selector de año.

Para que el resumen sea posible, la app empieza a guardar **cuándo** se vio cada obra y tres datos
de TMDB que hoy no guarda: géneros, duración y directores.

**Fuera de alcance:** ver una obra más de una vez (D3), compartir el resumen, comparar dos años y
estadísticas de obras que no están en *vista*.

### 7.2 Historias de usuario

| Id | Historia | Idea central del criterio | Decisiones |
|---|---|---|---|
| HU-A.1 | Como usuario, quiero que la app recuerde cuándo vi cada obra | Marcar como vista guarda la fecha; dejar de estar vista la borra | D1, D5 |
| HU-A.2 | Como usuario, quiero ver mi resumen del año | Totales, horas, género, director, mes más activo y obra destacada | D3, D7 a D11 |
| HU-A.3 | Como usuario, quiero cambiar de año | El selector muestra solo los años con obras vistas, más el actual | D4, D12 |
| HU-A.4 | Como usuario, quiero ver mi resumen aunque mis obras sean anteriores a esta épica | Las obras ya vistas reciben fecha y datos de TMDB sin perder nada | D2, D6 |
| HU-A.5 | Como usuario, quiero entender un resumen vacío o incompleto | Estados de carga, vacío, error, sin conexión y datos faltantes, cada uno con su mensaje | D6, D7, D9, D11 a D13 |

Los criterios DADO / CUANDO / ENTONCES y los tickets están en `docs/backlog/`.

### 7.3 Reglas de negocio (decisiones del cliente)

Ninguna de estas reglas vive en una pantalla. Todas se calculan en funciones de dominio puras
(`src/dominio/`), probadas con Vitest.

| # | Tema | Decisión |
|---|---|---|
| D1 | Fecha de visionado | Nuevo campo `vistaEn`. Se guarda con `serverTimestamp` cuando la obra **pasa a** *vista*. Si deja de estar vista, vuelve a `null`; si vuelve a *vista*, toma la fecha nueva. Editar la calificación o el comentario no la cambia. |
| D2 | Obras vistas antes de esta épica | Al abrir *Mi año en cine*, las obras en *vista* sin `vistaEn` reciben `vistaEn = actualizadoEn`. Se hace una sola vez y se guarda en Firestore. |
| D3 | A qué año pertenece una obra | Al año calendario de `vistaEn` **en la hora local del teléfono**. Cada obra cuenta una sola vez: no hay revisionados. |
| D4 | Años del selector | Los años con al menos una obra vista, más el año actual, del más reciente al más antiguo. El selector abre en el año actual. |
| D5 | Datos de TMDB | Al agregar una obra se guardan `generos` (nombres en español), `duracionMin` (solo películas; en series es `null`) y `directores` (solo películas; en series es una lista vacía). |
| D6 | Obras guardadas sin esos datos | Al abrir el resumen se completan desde TMDB las obras vistas **del año elegido** que no los tengan, de una en una y con progreso visible. Si TMDB falla para una obra, esta cuenta en el total pero no en horas, género ni director, y el resumen dice cuántas quedaron sin datos. |
| D7 | Horas de cine | Suma de `duracionMin` de las películas vistas, en horas con un decimal (37,5 h). Las series cuentan como obras, no en horas. Una película sin duración no suma, y el resumen lo indica. |
| D8 | Género más visto | Cada obra suma 1 a cada uno de sus géneros. Gana el que tenga más obras. Empate: mayor promedio de calificación personal entre sus obras calificadas (un género sin obras calificadas pierde). Si persiste: orden alfabético. |
| D9 | Director más visto | Solo películas; cada director suma 1. Mismo desempate que D8. Si ninguna película tiene director, la tarjeta dice que no hay datos suficientes. |
| D10 | Mes más activo | El mes con más obras vistas. Empate: el más reciente. Se muestran los 12 meses del año, también los que tienen 0. |
| D11 | Obra destacada | La de mayor calificación personal. Empate: la de `vistaEn` más reciente. Si no hay obras calificadas, la tarjeta invita a calificar. |
| D12 | Resumen vacío | Un año sin obras vistas muestra un estado vacío con el botón *Ir a Mi lista*. |
| D13 | Sin conexión | El resumen se calcula con la copia de AsyncStorage y muestra un aviso. Sin conexión no se completan datos ni se migran fechas. |

### 7.4 Cambios al modelo de datos y al dominio

La ruta no cambia: `usuarios/{uid}/mi_lista/{itemId}`. Cada documento suma cuatro campos:

| Campo | Tipo | Descripción |
|---|---|---|
| `vistaEn` | marca de tiempo o nulo | Cuándo pasó a *vista* (D1 y D2) |
| `generos` | lista de texto | Nombres de género de TMDB en español, máximo 10 |
| `duracionMin` | número o nulo | Duración en minutos; `null` en series o si TMDB no la trae |
| `directores` | lista de texto | Directores de la película, máximo 10; vacía en series |

Las reglas de Firestore validan estos campos sin romper los documentos que todavía no los tienen,
leyéndolos con `get(campo, valorPorDefecto)`. Esta es la parte nueva de `esItemValido`:

```
&& (d.get('vistaEn', null) == null || (d.estado == 'vista' && d.vistaEn is timestamp))
&& (d.get('generos', []) is list && d.get('generos', []).size() <= 10)
&& (d.get('duracionMin', null) == null
    || (d.duracionMin is int && d.duracionMin > 0 && d.duracionMin <= 1000))
&& (d.get('directores', []) is list && d.get('directores', []).size() <= 10)
```

**Dominio** (`src/dominio/resumenAnual.ts`, sin Firebase ni fecha del sistema; el año actual se
recibe como parámetro):

```ts
export interface ResumenAnual {
  anio: number
  totalObras: number
  peliculas: number
  series: number
  horas: number                  // con un decimal (D7)
  peliculasSinDuracion: number
  obrasSinDatos: number          // D6
  generoTop: { nombre: string; obras: number } | null
  directorTop: { nombre: string; obras: number } | null
  obrasPorMes: number[]          // 12 posiciones, enero = 0 (D10)
  mesTop: number | null
  destacada: ItemLista | null    // D11
}

export function aniosDisponibles(items: ItemLista[], anioActual: number): number[]
export function resumenAnual(items: ItemLista[], anio: number): ResumenAnual
```

### 7.5 Puntos abiertos

Son casos que D1 a D13 no cubren. Cada uno tiene una propuesta, que se aplica mientras el cliente
no responda. Si el cliente decide otra cosa, la respuesta se anota aquí y se actualizan los
criterios, la spec y los tests.

| # | Caso no cubierto | Propuesta | Estado |
|---|---|---|---|
| PA-1 | **Sin conexión y sin `vistaEn`.** D13 prohíbe migrar fechas sin conexión, y la copia local no guarda `actualizadoEn`. Una obra *vista* anterior a la épica no tiene año. | No cuenta en ningún año mientras no se migre. El aviso sin conexión dice cuántas obras vistas quedaron sin fecha. | Propuesta aceptada (2026-11-25); por confirmar con el docente |
| PA-2 | **Cómo se distingue una obra "sin datos" (D6).** Una película puede no tener géneros en TMDB, y entonces `generos` es `[]` aunque ya se consultó. | "Sin datos" significa que el campo `generos` no existe en el documento. Si TMDB responde con listas vacías, la obra queda completada (con `[]`) y no se vuelve a consultar. | Propuesta aceptada (2026-11-25); por confirmar con el docente |
| PA-3 | **Reintentos de D6.** Si TMDB falla para una obra, ¿se reintenta la próxima vez que se abre el resumen? | Sí: la obra sigue sin el campo `generos`, así que se reintenta cada vez que se abre el resumen con conexión. Un 404 (la obra ya no existe en TMDB) se guarda como completada con listas vacías, para no reintentarla siempre. | Propuesta aceptada (2026-11-25); por confirmar con el docente |
| PA-4 | **Redondeo de horas (D7).** "Un decimal" no dice cómo se redondea. | Redondeo al décimo más cercano, con los empates hacia arriba: 2245 min = 37,416… h → 37,4 h; 2247 min = 37,45 h → 37,5 h. | Propuesta aceptada (2026-11-25); por confirmar con el docente |
| PA-5 | **Orden alfabético (D8 y D9).** Los nombres en español llevan tildes ("Acción", "Animación"). | Comparación con `localeCompare(…, 'es', { sensitivity: 'base' })`, sin distinguir tildes ni mayúsculas. | Propuesta aceptada (2026-11-25); por confirmar con el docente |
| PA-6 | **Empate total en la obra destacada (D11).** Dos obras con la misma calificación y el mismo `vistaEn`. Puede pasar con obras migradas por D2 en el mismo instante. | Si persiste el empate: orden alfabético del título (como en PA-5). | Propuesta aceptada (2026-11-25); por confirmar con el docente |
| PA-7 | **`actualizadoEn` en las escrituras del sistema.** Las reglas exigen `actualizadoEn == request.time` en cada `update`, así que la migración (D2) y el completado (D6) lo cambian. | Se acepta: `actualizadoEn` pasa a significar "última escritura". En D2, `vistaEn` toma el valor anterior de `actualizadoEn` en la misma escritura que lo cambia. | Propuesta aceptada (2026-11-25); por confirmar con el docente |
| PA-8 | **Más de 10 géneros o directores.** Las reglas limitan cada lista a 10. | Se guardan los 10 primeros que devuelve TMDB. | Propuesta aceptada (2026-11-25); por confirmar con el docente |
| PA-9 | **Cambio de año mientras se completan datos (D6).** El usuario cambia el año en el selector a mitad del progreso. | El completado del año anterior se detiene y empieza el del año nuevo. Lo que ya se guardó se conserva. | Propuesta aceptada (2026-11-25); por confirmar con el docente |
