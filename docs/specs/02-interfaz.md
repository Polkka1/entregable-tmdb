# Spec 02 · Interfaz de Mi año en cine (Hito 4)

**Fuentes:** `docs/specs/01-mi-anio-en-cine.md` §8 y §10, `DESIGN.md` §3 a §6 y los tickets T-A08 a
T-A11 de `docs/backlog/EA-mi-anio-en-cine.md`.
**Fecha:** 2026-11-26.

Plan por tickets del Hito 4. Los valores visuales no se repiten aquí: salen de DESIGN.md y de
`src/tema/tema.ts`.

## 1. Orden y commits

| # | Ticket | Qué | Commit |
|---|---|---|---|
| 1 | — | Esta spec | `docs:` |
| 2 | T-A08 | Tests de `src/utils/textosResumen.ts` (plurales y mensajes de DESIGN.md §5), en rojo | `test:` |
| 3 | T-A08 | `textosResumen.ts` | `feat:` |
| 4 | T-A08 | Componentes de la épica | `feat:` |
| 5 | T-A09 | Pestaña y pantalla *Mi año en cine* | `feat:` |
| 6 | T-A10 | Sensor de tamaños de letra sueltos, en rojo | `test:` |
| 7 | T-A10 | Pantallas y componentes del Proyecto 3 con los tokens; borrar los alias `@deprecated` | `feat:` |
| 8 | T-A11 | VERIFICACION.md, auditoría final, README e IA.md | `docs:` |

## 2. T-A08 · Componentes (`src/components/`)

| Componente | Archivo | Notas |
|---|---|---|
| `TarjetaDato` | `TarjetaDato.tsx` | `rotulo`, `valor`, `detalle?`, `falta?`, `valorEsNombre?` (usa `subtitulo` en lugar de `dato`) |
| `BarrasPorMes` | `BarrasPorMes.tsx` | Recibe `obrasPorMes` y `mesTop`. Alto máximo de 120. Solo `View`. Cada columna es `accessible` con "julio: 8 obras" |
| `TarjetaDestacada` | `TarjetaDestacada.tsx` | `obra: ItemLista \| null` y `onIrAMiLista`. Con `null` muestra la variante vacía |
| `SelectorAnio` | `SelectorAnio.tsx` | `anios`, `seleccionado` y `onCambiar`. `ScrollView` horizontal de `Chip` |
| `Aviso` | `Aviso.tsx` | `tipo: 'sinConexion' \| 'datosFaltantes'` y `texto`. Reemplaza a `AvisoSinConexion`, que pasa a usarlo |
| `Progreso` | en `EstadosPantalla.tsx` | `hechas` y `total`. Barra lineal y "n de m obras" |

`Chip` suma la prop `colorSeleccionado?`, que usa `SelectorEstado` para rellenar el chip
seleccionado con el color de su estado.

## 3. T-A09 · Pantalla

- `TabsParamList` suma `MiAnio: undefined`, entre `MiLista` y `AcercaDe`. Título "Mi año"; ícono
  `calendar` / `calendar-outline` (DESIGN.md §8).
- `src/screens/MiAnioScreen.tsx` solo lee `useResumenAnual(anio)`. El año seleccionado es estado
  local que empieza en el año actual (D4).
- **Estados**, en este orden de prioridad:
  1. `preparacion` en `cargando` → `Cargando` ("Preparando tu año…");
  2. `preparacion` en `error` → `MensajeError` con *Reintentar*;
  3. `resumen.totalObras === 0` → `MensajeVacio` con *Ir a Mi lista*. El selector sigue visible;
  4. si no, el resumen.

  `Aviso` sin conexión y `Progreso` se muestran encima del contenido; no lo reemplazan.
- **Textos:** todos salen de `textosResumen.ts`.
- **Verificación de PA-3 al volver a la pestaña:** las pestañas no se desmontan, así que el hook
  reintenta las obras fallidas al reiniciar la app. Se anota en la auditoría final.

## 4. T-A10 · Proyecto 3 con tokens

- **Sensor nuevo:** `src/tema/sinTamanosSueltos.test.ts`. Falla si un archivo de `src/screens/` o
  `src/components/` escribe `fontSize:` con un número (DESIGN.md §7: `...tipografia.dato`, no
  `fontSize: 32`). Va en un commit `test:` en rojo, antes de la migración.
- **Migración:** cada `fontSize` / `fontWeight` pasa al token de `tipografia` más cercano (por
  ejemplo, 13 → `secundario`, 15 → `cuerpo`, 22 y 28 → `titulo`). `peligro` → `error`, `exito` →
  `estadoVista`, `estrella` → `celebracion`, y se borran los alias.
- `TarjetaLista` → `TarjetaObra`, con la insignia de punto y texto de DESIGN.md §3.
- El selector de estado de `EditarEntradaScreen` pasa a `SelectorEstado`.
- `AvisoSinConexion` usa `Aviso`.
- **Acerca de:** wordmark con isotipo y "Cartelera" en `acento`; `TmdbLogo` de 96 px.

## 5. Verificación

- `npm test`, `npx tsc --noEmit` y `npx expo lint` en verde, incluidos los dos sensores de
  `src/tema/`.
- Los criterios con verificación "Teléfono" de la spec 01 §10 se prueban en Expo Go y se
  registran en `docs/VERIFICACION.md`.
