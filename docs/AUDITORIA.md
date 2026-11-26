# Auditoría · Mi Cartelera Personal

## Auditoría inicial

**Fecha:** 2026-11-24
**Alcance:** el código de la etiqueta `p3-final` (commit `7c0cd4f`) comparado con `docs/prd/PRD.md`
(RF1 a RF10, SEG1 a SEG3, RNF1 a RNF9), con la rúbrica del Entregable 2 y con lo que el Entregable 3
exige del repositorio (secciones 1.7, 1.9 y 1.10).
**Método:** lectura completa de `src/`, `App.tsx`, `firestore.rules` y la configuración del
proyecto, más las herramientas de verificación que ya existen.

**Verificación de base:**

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | Sin errores |
| `npx expo lint` | Sin errores ni advertencias |
| `npx expo-doctor` | 1 comprobación falla: 9 paquetes no coinciden con la versión que espera el SDK 58 (ver A-05) |
| `npm test` | No existe: el proyecto no tiene tests (ver A-01) |
| Búsqueda de `any` en `src/` | 0 coincidencias |
| Búsqueda de colores hexadecimales fuera de `src/theme/` | 3, todos en `components/TmdbLogo.tsx` (ver A-08) |
| `git log --all -- .env` | Vacío: `.env` nunca entró al historial |

### Cumplimiento por requisito

| Requisito | Estado | Evidencia |
|---|---|---|
| RF1 Sesión | Cumple | `authService.ts` (`MENSAJE_ERROR_AUTH`), `firebase.ts` (`getReactNativePersistence`), `RootNavigator.tsx` (navegación condicional), `LoginScreen.tsx` (`validar`) |
| RF2 Búsqueda | Cumple | `tmdbService.ts` (`buscar`, `esObra`), `useBusqueda.ts` (espera entre teclas, paginación), `BuscarScreen.tsx` (estados inactivo, cargando, error, sin resultados) |
| RF3 Detalle | Cumple | `tmdbService.ts` (`obtenerDetalle` con `append_to_response=credits`), `DetalleScreen.tsx` (`SINOPSIS_ALTERNATIVA`, elenco vacío), `Poster.tsx` (relleno) |
| RF4 Agregar | Cumple | `listaService.ts` (`agregarItem`: `getDoc` antes de `setDoc`), `crearItemId`; las reglas rechazan sobrescribir un documento existente |
| RF5 Mi lista | Cumple | `MiListaScreen.tsx` (filtros por estado con conteo y por tipo), `TarjetaLista.tsx` (calificación personal) |
| RF6 Editar | Cumple, con observación (A-06) | `normalizarCambios`, `EditarEntradaScreen.tsx` (`cambiarEstado`), `firestore.rules` (`esItemValido`) |
| RF7 Quitar | Cumple | `EditarEntradaScreen.tsx` (`confirmarQuitar` con `Alert.alert`) |
| RF8 Sin conexión | Cumple, con observación (A-07) | `cacheService.ts`, `CarteleraContext.tsx` (`sincronizar`, `exigirConexion`, `conTiempoMaximo` de 10 s), `AvisoSinConexion.tsx` |
| RF9 Acerca de | Cumple | `AcercaDeScreen.tsx`: marca de 64 px con título de 28 px, más prominente que `TmdbLogo` de 120 px de ancho; aviso obligatorio; cerrar sesión con confirmación |
| RF10 TypeScript y capas | Cumple | 0 `any`; `Record<EstadoVisto, …>` y `assertNever` en los `switch`; ninguna pantalla importa `firebase`; el único cast (`http.ts`, `obtenerJson`) está justificado con un comentario |
| SEG1 a SEG3 | Cumple, con observación (A-10) | `firestore.rules` (`esDueno`, `esItemValido`, `affectedKeys().hasOnly`); capturas del Rules Playground en `docs/` |
| RNF4 Tres estados | Cumple | `usePeticion.ts` y `useBusqueda.ts` devuelven `EstadoPeticion<T>` |
| RNF6 44 px | Cumple | `Chip`, `Estrellas`, `Boton` (+4) y el botón de borrar en `BuscarScreen` usan `ALTURA_TOCABLE_MIN` |

### Hallazgos

| Id | Hallazgo | Evidencia | Gravedad | Decisión |
|---|---|---|---|---|
| A-01 | No hay ningún sensor automático: ni tests, ni Vitest, ni formateador, ni script `test`. Una regla de negocio como RF6 puede romperse sin que nada lo detecte. El Entregable 3 exige tests y un hook de formato. | `package.json` (`scripts`); no existe ningún `*.test.ts` | Alta | Corregir ahora: hook de Prettier (paso 4) y Vitest con un test de RF6 (paso 5). |
| A-02 | El harness no existe o no sirve: AGENTS.md es la plantilla de Expo en inglés, recomienda comandos genéricos y no dice qué hace la app, cómo son sus capas ni que `.env` no se lee. Tampoco hay CLAUDE.md. | `AGENTS.md`; falta `CLAUDE.md` | Media | Corregir ahora (paso 3). |
| A-03 | La estructura no coincide con la del Entregable 3 (1.9): los tokens están en `src/theme/tema.ts` en lugar de `src/tema/`, y no existe `src/dominio/`. El test de colores fijos va a excluir solo `src/tema/`. | `src/theme/tema.ts`; los imports `../theme/tema` en 16 archivos | Media | Corregir ahora: mover a `src/tema/tema.ts` en un commit `chore:` que solo cambia rutas. `src/dominio/` se crea en el Hito 3 con su primer archivo. |
| A-04 | Los tamaños de letra no tienen token: hay 43 `fontSize` escritos a mano en pantallas y componentes, y `tema.ts` no tiene escala tipográfica. El Entregable 3 pide que "colores y tamaños salgan de `src/tema/`". | `DetalleScreen.tsx` (10), `LoginScreen.tsx` (7), `AcercaDeScreen.tsx` (6), `EditarEntradaScreen.tsx` (6) y 7 archivos más; `tema.ts` | Media | Corregir en el Hito 4: la escala sale del brand board y DESIGN.md (Hito 2) y los tokens se crean en el Hito 3. |
| A-05 | Nueve paquetes no coinciden con la versión que espera Expo SDK 58: `react-native-safe-area-context` es una versión menor atrás, y `expo`, `react-native`, `expo-image` y otros son parches atrás. Expo Go del teléfono trae las versiones nuevas, así que puede haber advertencias o diferencias de comportamiento. | Salida de `npx expo-doctor`; `package.json` | Media | Corregir ahora con `npx expo install --fix` en un commit `chore:` aparte, y verificar con `tsc`, `lint` y Expo Go antes de seguir. |
| A-06 | `normalizarCambios` no comprueba que la calificación sea un entero de 1 a 5: confía en que la interfaz (`Estrellas`) solo ofrece esos valores. Si otro llamador pasara 7 o 3,5, la app lo intentaría guardar y lo rechazarían las reglas con un error genérico de permiso. | `src/utils/lista.ts` (`normalizarCambios`); `firestore.rules` (`calificacionPersonal is int`) | Baja | Riesgo conocido. El servidor lo impide; no se cambia en esta épica. |
| A-07 | Sin conexión y sin copia local (por ejemplo, la primera vez en un teléfono), Mi lista muestra "Tu lista está vacía" con el aviso. La lista no está vacía, solo no se pudo cargar. | `MiListaScreen.tsx` (rama `lista.length === 0`); `CarteleraContext.tsx` (`sinConexion`) | Baja | Riesgo conocido. Se tiene en cuenta en el estado sin conexión de *Mi año en cine* (D13). |
| A-08 | `TmdbLogo` escribe tres colores hexadecimales: el degradado oficial del logo. El test de colores fijos del Hito 2 los va a detectar. | `src/components/TmdbLogo.tsx` (`Stop stopColor`) | Baja | Corregir en el Hito 4: pasar los colores a tokens de marca de TMDB en `src/tema/`. |
| A-09 | La copia de AsyncStorage se lee sin validar su forma (`as ItemLista[]`) y no tiene versión. Al cerrar sesión, la copia del usuario queda guardada en el teléfono. | `cacheService.ts` (`leerCopiaLista`); `AcercaDeScreen.tsx` (`confirmarCierre`) | Baja | Riesgo conocido. La forma de la copia se revisa en la spec de la épica (ver "Impacto previsto"). |
| A-10 | No hay `firebase.json` ni tests de las reglas: se publican a mano en la consola y se probaron en el Rules Playground. No se puede comprobar desde el repositorio que lo publicado coincide con `firestore.rules`. | Raíz del proyecto; `docs/reglas-*.png` | Baja | Riesgo conocido. En el Hito 3 se vuelven a publicar y se prueban con dos cuentas y con `duracionMin: -5`. |
| A-11 | La estructura difiere de la que sugería el Entregable 2: `services/firebase.ts` y `config/env.ts` en lugar de `firebase/config.ts`; `TarjetaLista` y `Chip` en lugar de `TarjetaObra` y `SelectorEstado`. | `src/services/firebase.ts`; `src/components/` | Baja | Fuera de alcance: era una sugerencia y la separación actual cumple RF10. En DESIGN.md se usan los nombres reales. |
| A-12 | Los commits del Proyecto 3 no siguen la convención de prefijos que pide el Entregable 3. | `git log p3-final` | Baja | Riesgo conocido: el historial publicado no se reescribe. La convención rige desde `epica-mi-anio`. |

### Impacto previsto de la épica *Mi año en cine*

No son defectos del Proyecto 3, pero el código actual impide la épica tal como está. Se resuelven
en la spec (Hito 3), antes de tocar el código:

- **Reglas:** `esItemValido` usa `keys().hasOnly([...])` con los 10 campos actuales, y `update`
  solo admite cambios en `estado`, `calificacionPersonal`, `comentario` y `actualizadoEn`. Hoy
  rechazarían `vistaEn`, `generos`, `duracionMin` y `directores`, así como las migraciones D2 y D6.
- **Lectura:** `aItemLista` (`listaService.ts`) construye el `ItemLista` campo por campo y
  descartaría los campos nuevos.
- **Caché:** `leerCopiaLista` devolvería copias antiguas sin los campos nuevos, tipadas como si los
  tuvieran (A-09). D13 calcula el resumen sin conexión justamente a partir de esta copia.
- **D1:** `actualizarItem` no recibe el estado anterior, así que no sabe si la obra "pasa a vista"
  o ya lo estaba. `CarteleraContext.actualizar` lo tiene disponible en `lista`.
- **D5:** `mapearPelicula` ya recibe `genres` (en español) y `runtime`, pero `runtime` solo se usa
  formateado en `infoAdicional`, y `credits.crew` (directores) no se mapea. `NuevaEntrada` solo
  copia título, año y póster.

### Riesgos conocidos

- **Clave de TMDB en el paquete:** todo valor `EXPO_PUBLIC_` se puede extraer de la app. Se acepta
  por ser un proyecto no comercial; la solución sería un proxy (`config/env.ts`, README).
- **Calificación fuera de rango (A-06):** solo la frena el servidor.
- **Lista vacía sin conexión (A-07):** el mensaje puede confundir en el primer uso sin red.
- **Copia local sin validar ni borrar (A-09).**
- **Reglas sin tests automáticos (A-10):** no hay Java en la máquina para el emulador de Firestore.
- **Historial sin prefijos (A-12).**

## Auditoría final

**Fecha:** 2026-11-26
**Alcance:** la rama `epica-mi-anio` al cierre del Hito 4, comparada con la auditoría inicial, la
spec 01, la spec 02 y `docs/VERIFICACION.md`.

**Verificación:**

| Comando o prueba | Resultado |
|---|---|
| `npm test` | 7 archivos, 101 tests en verde (`docs/npm-test-verde.png`) |
| `npx tsc --noEmit` y `npx expo lint` | Sin errores ni advertencias |
| `npx expo-doctor` | 20/20 comprobaciones |
| Reglas de Firestore publicadas | Probadas en el Rules Playground (`docs/reglas-*-e3.png`, `reglas-duracion-negativa.png`, `reglas-vistaen-por-ver.png`, `reglas-dueno-permitido.png`) |
| Verificación humana | iPhone 15 Pro Max con Expo Go; resultados en `docs/VERIFICACION.md` |

### Qué se resolvió

| Id | Hallazgo | Cómo quedó |
|---|---|---|
| A-01 | No había sensores | Hook de Prettier y Vitest con 101 tests: dominio (D1 a D13), textos, RF6 y RF4, colores fijos y tamaños sueltos |
| A-02 | AGENTS.md de plantilla, sin CLAUDE.md | AGENTS.md en español con capas, comandos, reglas y la obligación de leer DESIGN.md; CLAUDE.md = `@AGENTS.md` |
| A-03 | `src/theme` en lugar de `src/tema` | Movido (`7028fd3`); existe `src/dominio/` |
| A-04 | 43 tamaños de letra sueltos | Escala `tipografia` en `src/tema/`; todas las pantallas la usan y el sensor `sinTamanosSueltos` lo vigila |
| A-05 | 9 paquetes desfasados del SDK 58 | `npx expo install --fix` (`20099e9`) |
| A-08 | Colores hexadecimales del logo de TMDB | Tokens `tmdb1` a `tmdb3`; el sensor de colores fijos está en verde |
| Impacto de la épica | Reglas con `hasOnly`, `aItemLista`, D1 sin estado anterior, D5 sin directores | Resuelto en la spec 01 y en `c0a9666`, `86d4e11`, `8d49105` y `c77a26c` |

### Riesgos que siguen abiertos

- **A-06** (calificación fuera de rango): solo la frena el servidor. Sin cambios.
- **A-07** (lista "vacía" sin conexión en el primer uso): sin cambios en Mi lista. En *Mi año en
  cine*, el aviso sin conexión indica que se muestra la copia local.
- **A-09** (copia local): ahora se completan los campos que faltan en las copias antiguas, pero
  la copia sigue sin versión (la spec 01 §4.3 pedía `version: 2`) y queda en el teléfono al
  cerrar sesión.
- **A-10** (reglas sin tests automáticos): mitigado con las capturas del Rules Playground. El
  simulador no puede generar `serverTimestamp`, así que no hay un caso *permitido* de `create` o
  `update` en la consola; los casos permitidos se comprobaron desde la app (CA-A.1.1 a CA-A.1.4 y
  CA-A.1.11).
- **A-11 y A-12:** sin cambios (estructura sugerida y commits del Proyecto 3 sin prefijo).
- **Puntos abiertos PA-1 a PA-9:** se aplican las propuestas aceptadas por el estudiante. Siguen
  pendientes de confirmar con el docente.

### Hallazgos nuevos

| Id | Hallazgo | Evidencia | Gravedad | Decisión |
|---|---|---|---|---|
| F-01 | En el año vacío, los chips del selector se estiraban hasta media pantalla | `docs/resumen-vacio.jpeg`; `SelectorAnio.tsx` (el `ScrollView` crece por defecto) | Media | Corregido en `ddd833e` (`flexGrow: 0`). Hay que repetir la captura |
| F-02 | Las obras que fallan al completarse (D6) solo se reintentan al reiniciar la app: las pestañas no se desmontan, y el hook las marca como intentadas por montaje | `useResumenAnual.ts` (`intentadas`) | Baja | Riesgo conocido. PA-3 se cumple al reabrir la app |
| F-03 | Tras D1, la copia local usa la hora del teléfono hasta la próxima sincronización | `CarteleraContext.actualizar` | Baja | Riesgo conocido (spec 01 §11) |
| F-04 | HU-A.4 (migración D2 y reintentos) no se verificó a mano con una obra anterior a la épica. Hay evidencia indirecta de D6: el resumen de 2025 suma 14,9 h, que incluyen los 139 min de *El club de la lucha*, sembrada sin datos | `docs/VERIFICACION.md` §3 (HU-A.4), `docs/resumen-con-datos.jpeg` | Media | Repetir con `scripts/sembrarDatosPrueba.mjs` (grupo "anterior a la épica"). La lógica de D2 tiene tests (`obrasSinFecha`) |
| F-05 | Con D4, el único año que puede estar vacío en el selector es el actual; para mostrar D12 hace falta una cuenta sin obras vistas este año | PRD §7.3 (D4, D12) | Baja | Anotado en VERIFICACION §0; la demo usa cuenta2 |
| F-06 | `npm` reporta 13 vulnerabilidades (8 moderadas y 5 altas) en dependencias transitivas | Salida de `npm install` | Baja | Riesgo conocido: `npm audit fix` puede romper las versiones del SDK 58 |
| F-07 | El Proyecto 3 no tenía obras guardadas antes de la épica en las cuentas de prueba, así que D2 y D6 no se podían probar sin preparar datos | VERIFICACION §4 | Baja | Se agregó `scripts/sembrarDatosPrueba.mjs` (`286e018`) |
