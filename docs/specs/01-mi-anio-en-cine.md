# Spec 01 · Mi año en cine

**Fuentes:** `docs/prd/PRD.md` §7 (D1 a D13, PA-1 a PA-9), `docs/backlog/EA-mi-anio-en-cine.md`
(HU-A.1 a HU-A.5, criterios CA-A.x.y, tickets T-A01 a T-A11), `DESIGN.md` y `docs/AUDITORIA.md`
(sección "Impacto previsto de la épica").
**Fecha:** 2026-11-25.

## 1. Alcance

- Guardar `vistaEn` al pasar a *Vista* y borrarla al salir (D1).
- Guardar `generos`, `duracionMin` y `directores` al agregar una obra (D5).
- Al abrir *Mi año en cine* con conexión: migrar `vistaEn` de las obras vistas antes de la épica
  (D2) y completar los datos de TMDB de las obras del año elegido (D6).
- Calcular el resumen anual y los años disponibles en funciones puras (D3, D4, D7 a D11).
- La pestaña y la pantalla *Mi año en cine*, con sus estados (D12, D13, PA-1).
- Reglas de Firestore para los campos nuevos.
- Tokens de `src/tema/` según DESIGN.md, incluidos los del logo de TMDB.

## 2. Fuera de alcance

- Revisionados (D3), compartir el resumen, comparar años, animaciones y modo claro.
- Recalcular `vistaEn` de obras que ya la tienen.
- Pasar todas las pantallas del Proyecto 3 a la escala tipográfica: es T-A10 (Hito 4).

## 3. Orden de implementación

Por decisión del 2026-11-25, los tokens (T-A07) van antes que los tests del dominio. Así el test de
colores fijos ya está en verde cuando el dominio exige `npm test` en verde.

| # | Ticket | Commit |
|---|---|---|
| 1 | T-A01 · esta spec | `docs:` |
| 2 | T-A07 · tokens en `src/tema/` y `TmdbLogo` con tokens | `feat:` |
| 3 | T-A02 · tests del dominio en rojo | `test:` |
| 4 | T-A03 · dominio | `feat:` |
| 5 | T-A06 · reglas de Firestore | `feat:` (+ publicación manual) |
| 6 | T-A04 · modelo y servicios (D1, D5, caché) | `feat:` |
| 7 | T-A05 · migración y completado (D2, D6) | `feat:` |
| 8 | T-A08 a T-A11 | Hito 4, con su propio plan |

## 4. Cambios al modelo

### 4.1 Firestore

Ruta sin cambios: `usuarios/{uid}/mi_lista/{itemId}`. Campos nuevos, todos opcionales para los
documentos antiguos:

| Campo | Firestore | Escribe | Nota |
|---|---|---|---|
| `vistaEn` | timestamp o null | D1 (`serverTimestamp()` o `null`), D2 (copia de `actualizadoEn`) | Solo puede existir si `estado == 'vista'` |
| `generos` | lista de texto (≤ 10) | D5 al agregar, D6 al completar | **Ausente = sin datos** (PA-2). Nunca se escribe `null` |
| `duracionMin` | entero 1 a 1000 o null | D5, D6 | `null` en series, sin dato o fuera de rango |
| `directores` | lista de texto (≤ 10) | D5, D6 | `[]` en series |

### 4.2 TypeScript (`src/types/lista.ts`)

```ts
export interface ItemLista {
  // …campos del Proyecto 3…
  /** Milisegundos desde 1970 (UTC). null si no está vista o si aún no se migró (D2). */
  vistaEn: number | null;
  /** null = sin datos de TMDB (campo ausente en Firestore, PA-2). */
  generos: string[] | null;
  duracionMin: number | null;
  /** null = sin datos de TMDB. [] en series. */
  directores: string[] | null;
}

/** Datos de TMDB que se guardan al agregar o al completar (D5, D6). */
export interface DatosTmdb { generos: string[]; duracionMin: number | null; directores: string[] }

export type NuevaEntrada = Pick<ItemLista, 'tmdbId' | 'tipo' | 'titulo' | 'anio' | 'posterPath'> & DatosTmdb;
```

- `vistaEn` se guarda como número para que la copia de AsyncStorage sea JSON plano y el dominio
  no dependa de `Timestamp` de Firebase. `aItemLista` convierte con `toMillis()`.
- `DetalleObra` (`src/types/tmdb.ts`) suma `duracionMin: number | null` y `directores: string[]`;
  `TmdbDetalleBase.credits` suma `crew: { job: string; name: string }[]`.

### 4.3 Copia de AsyncStorage (`cacheService.ts`)

- La copia pasa a `{ version: 2, guardadoEn, items }`.
- `leerCopiaLista` valida cada ítem con la misma función que usa `aItemLista` (se extrae a
  `src/services/convertirItem.ts`). Un ítem de una copia antigua sin campos nuevos queda con
  `vistaEn`, `generos`, `duracionMin` y `directores` en `null`. Un ítem inválido se descarta, sin
  romper la lista (auditoría A-09).

## 5. Dominio (`src/dominio/`)

Funciones puras: sin `react-native`, `firebase`, servicios ni la fecha del sistema. `new Date(ms)`
con argumento sí se permite, para obtener el año y el mes en la hora local (D3).

**Zona horaria de los tests:** `vitest.config.mts` fija `TZ = 'America/Guayaquil'` (UTC−5, sin
horario de verano). Así CA-A.2.1 da el mismo resultado en cualquier máquina. Un test comprueba que
la zona está fijada.

### 5.1 `vistaEn.ts`

| Función | Contrato | Decisiones · Criterios |
|---|---|---|
| `cambioVistaEn(anterior: EstadoVisto, nuevo: EstadoVisto): 'asignar' \| 'borrar' \| 'mantener'` | `asignar` si `nuevo === 'vista'` y `anterior !== 'vista'`; `borrar` si `anterior === 'vista'` y `nuevo !== 'vista'`; `mantener` en los demás casos | D1 · CA-A.1.1 a CA-A.1.5 |
| `anioDeVista(vistaEn: number): number` y `mesDeVista(vistaEn: number): number` | `new Date(vistaEn).getFullYear()` y `.getMonth()` (0 = enero), en hora local | D3 · CA-A.2.1 |
| `obrasSinFecha(items): ItemLista[]` | Obras con `estado === 'vista'` y `vistaEn === null`. La usa D2 (cuáles migrar) y PA-1 (cuántas avisar sin conexión) | D2, PA-1 · CA-A.4.2, CA-A.4.3, CA-A.5.4 |

### 5.2 `datosTmdb.ts`

| Función | Contrato | Decisiones · Criterios |
|---|---|---|
| `datosParaGuardar(tipo: TipoMedio, detalle: { generos: string[]; duracionMin: number \| null; directores: string[] }): DatosTmdb` | `generos`: los 10 primeros, sin repetidos ni vacíos. Película: `duracionMin` si es un entero de 1 a 1000 (si no, `null`) y los 10 primeros `directores` sin repetidos. Serie: `duracionMin: null` y `directores: []` | D5, PA-8 · CA-A.1.6 a CA-A.1.9 |
| `datosVacios(): DatosTmdb` | `{ generos: [], duracionMin: null, directores: [] }`, para una obra que TMDB ya no tiene (404) | PA-3 · CA-A.4.9 |
| `tieneDatos(item): boolean` | `item.generos !== null` | PA-2 |
| `obrasPorCompletar(items, anio): ItemLista[]` | Vistas, con `vistaEn` en `anio` y sin datos, en el orden de la lista | D6 · CA-A.4.5, CA-A.4.6 |

### 5.3 `resumenAnual.ts`

Exporta `ResumenAnual` (la interfaz de PRD §7.4), `aniosDisponibles` y `resumenAnual`, más
`redondearHoras` y `elegirTop` para poder probarlas por separado.

**`aniosDisponibles(items, anioActual)`** · años de las obras con `estado === 'vista'` y `vistaEn`
distinto de `null`, más `anioActual`; sin repetidos y del más reciente al más antiguo (D4 ·
CA-A.3.1 a CA-A.3.4).

**`resumenAnual(items, anio)`** · trabaja con `delAnio` = obras con `estado === 'vista'`,
`vistaEn !== null` y `anioDeVista(vistaEn) === anio` (D3 · CA-A.2.1, CA-A.2.2).

| Campo | Cálculo | Decisiones · Criterios |
|---|---|---|
| `totalObras`, `peliculas`, `series` | Conteo de `delAnio` por `tipo` | CA-A.2.3 |
| `obrasSinDatos` | Obras de `delAnio` sin datos. Cuentan en el total, pero no en horas, género ni director | D6 · CA-A.4.7 |
| `horas` | `redondearHoras(Σ duracionMin)` de las películas con datos y duración. `redondearHoras(min) = Math.round(min / 6) / 10`: se divide entre 6 y no entre 60 × 10 para evitar el error de coma flotante | D7, PA-4 · CA-A.2.4, CA-A.2.5 |
| `peliculasSinDuracion` | Películas **con datos** y `duracionMin === null`. Las películas sin datos van en `obrasSinDatos`, no aquí | D7 · CA-A.2.6 |
| `generoTop` | `elegirTop` sobre todas las obras con datos: cada obra suma 1 a cada uno de sus géneros (sin repetir el mismo género dentro de una obra) | D8, PA-5 · CA-A.2.7 a CA-A.2.10 |
| `directorTop` | `elegirTop` sobre las **películas** con datos y sus `directores`. `null` si ninguna tiene director | D9 · CA-A.2.11 a CA-A.2.13 |
| `obrasPorMes` | 12 posiciones; `mesDeVista` de cada obra de `delAnio` | D10 · CA-A.2.14 |
| `mesTop` | El índice con más obras; empate: el mayor índice (el más reciente); `null` si `totalObras === 0` | D10 · CA-A.2.14, CA-A.2.15 |
| `destacada` | Entre las obras de `delAnio` con calificación: la mayor calificación; empate: el `vistaEn` mayor; empate: el título primero según `localeCompare(…, 'es', { sensitivity: 'base' })`. `null` si ninguna está calificada | D11, PA-6 · CA-A.2.16 a CA-A.2.18 |

**`elegirTop(grupos: Map<string, ItemLista[]>)`: `{ nombre, obras } | null`** · ordena por:
1. más obras;
2. mayor promedio de `calificacionPersonal` entre las obras calificadas del grupo; un grupo sin
   calificadas va detrás de cualquiera que las tenga;
3. nombre según `localeCompare(…, 'es', { sensitivity: 'base' })`.

Devuelve `null` si no hay grupos.

Un año sin obras devuelve `totalObras: 0`, los 12 meses en 0 y `null` en todos los "top" (D12 ·
CA-A.3.7).

## 6. Servicios

### 6.1 `tmdbService.ts`

- `mapearPelicula`: `duracionMin: d.runtime ?? null` y `directores` = nombres de `credits.crew`
  con `job === 'Director'`.
- `mapearSerie`: `duracionMin: null` y `directores: []`.
- `obtenerDetalle` ya trae `append_to_response=credits`, así que no se necesita otra petición.

### 6.2 `listaService.ts`

| Función | Cambio | Decisiones |
|---|---|---|
| `agregarItem(uid, entrada)` | `entrada` incluye `DatosTmdb` (ya pasados por `datosParaGuardar`). El documento nuevo no lleva `vistaEn` (se crea en *Por ver*) | D5 |
| `actualizarItem(uid, itemId, cambios, estadoAnterior)` | Con `cambioVistaEn(estadoAnterior, cambios.estado)`: `asignar` agrega `vistaEn: serverTimestamp()`, `borrar` agrega `vistaEn: null` y `mantener` no toca el campo. Devuelve los cambios y la decisión | D1 |
| `migrarFechasVista(uid): Promise<number>` **nueva** | Lee los documentos con `estado == 'vista'`, elige con `obrasSinFecha` los que no tienen `vistaEn` y, en un `writeBatch`, escribe `vistaEn = actualizadoEn` (el `Timestamp` leído) y `actualizadoEn = serverTimestamp()`. Devuelve cuántas migró. Tiempo máximo: 10 s | D2, PA-7 |
| `guardarDatosTmdb(uid, itemId, datos)` **nueva** | `updateDoc` con `generos`, `duracionMin`, `directores` y `actualizadoEn: serverTimestamp()` | D6, PA-7 |

`aItemLista` lee los cuatro campos nuevos: `vistaEn` con `toMillis()`, y las listas solo si son
listas de texto (si no, `null`).

### 6.3 Contexto y hooks

- **`CarteleraContext.actualizar`** pasa al servicio el estado anterior, que ya tiene en `lista`.
  Después de guardar, la copia local recibe `vistaEn = Date.now()` si fue `asignar` (es una
  aproximación: la próxima sincronización trae la hora del servidor), o `null` si fue `borrar`.
- **`CarteleraContext`** suma dos acciones:
  - `migrarFechas()`: llama a `migrarFechasVista` y, si migró algo, vuelve a sincronizar la lista.
  - `completarDatos(item)`: pide el detalle a TMDB, lo pasa por `datosParaGuardar`, lo guarda con
    `guardarDatosTmdb` y actualiza el ítem local. Un 404 de TMDB guarda `datosVacios()` (PA-3);
    cualquier otro error se propaga.

  Las dos exigen conexión (D13).
- **`useResumenAnual(anio)`** (nuevo, `src/hooks/`) es lo único que usa la pantalla. Devuelve:
  - `preparacion: EstadoPeticion<true>` para la migración (D2). Con conexión se ejecuta una vez
    por montaje; sin conexión queda en éxito sin hacer nada (D13).
  - `progreso: { hechas, total } | null` durante el completado (D6). Recorre
    `obrasPorCompletar(lista, anio)` de una en una; si cambia `anio`, la vuelta en curso termina
    después de la obra actual y empieza la del año nuevo (PA-9). Un fallo no detiene las demás.
    Cada obra se intenta una vez por montaje y por año; las que fallaron se vuelven a intentar
    en la siguiente apertura (PA-3).
  - `resumen: ResumenAnual = resumenAnual(lista, anio)` y `anios = aniosDisponibles(lista,
    anioActual)`, con `anioActual = new Date().getFullYear()` (en el hook, no en el dominio).
  - `sinFecha: number = obrasSinFecha(lista).length`, que solo se muestra sin conexión (PA-1).
  - `reintentar()` para la migración.

## 7. Reglas de Firestore (`firestore.rules`)

```
// Campos nuevos (Entregable 3, PRD §7.4): opcionales para no romper los documentos antiguos.
function camposNuevosValidos(d) {
  return (d.get('vistaEn', null) == null || (d.estado == 'vista' && d.vistaEn is timestamp))
    && (d.get('generos', []) is list && d.get('generos', []).size() <= 10)
    && (d.get('duracionMin', null) == null
        || (d.duracionMin is int && d.duracionMin > 0 && d.duracionMin <= 1000))
    && (d.get('directores', []) is list && d.get('directores', []).size() <= 10);
}
```

- **`esItemValido`:** `hasAll` sigue con los 10 campos del Proyecto 3; `hasOnly` suma `vistaEn`,
  `generos`, `duracionMin` y `directores`; se agrega `&& camposNuevosValidos(d)`.
- **`create`:** además exige `request.resource.data.get('vistaEn', null) == null`.
- **`update`:** `affectedKeys().hasOnly([...])` suma los cuatro campos nuevos.
- **Publicación (manual):** pegar el archivo en la consola y publicar. Probar en el Rules
  Playground:
  - `duracionMin: -5` → denegado;
  - `vistaEn` con estado `por_ver` → denegado;
  - la cuenta B leyendo la lista de A → denegado;
  - un `update` sobre un documento sin campos nuevos → permitido.

## 8. Interfaz (Hito 4, resumen)

Los componentes y el orden de la pantalla son los de DESIGN.md §3 y §4; aquí no se repiten los
valores.

- **Pestaña:** `MiAnio` en `TabsParamList`, entre `MiLista` y `AcercaDe`, con el título "Mi año"
  y el ícono de DESIGN.md §8.
- **Pantalla:** `src/screens/MiAnioScreen.tsx`. Usa `SelectorAnio`, `TarjetaDestacada`,
  `BarrasPorMes`, `TarjetaDato`, `Aviso` y `EstadosPantalla` (`Cargando`, `Progreso`,
  `MensajeVacio`, `MensajeError`).
- **Textos:** los de DESIGN.md §5. Los plurales los resuelve `src/utils/textosResumen.ts`, que
  tiene tests.

## 9. Tokens (`src/tema/tema.ts`)

Se reescribe con los nombres y valores de DESIGN.md §2: `colores` (incluidos `tmdb1` a `tmdb3`),
`tipografia`, `espacio` (con `xxxl`), `radio` y `ALTURA_TOCABLE_MIN`.

Para no romper las pantallas del Proyecto 3 antes de T-A10, se conservan como **alias marcados
`@deprecated`** los nombres viejos que todavía se usan (`peligro → error`, `exito → estadoVista`,
`estrella → celebracion`). Se borran en T-A10. `TmdbLogo` usa `colores.tmdb1` a `tmdb3`.

## 10. Criterio → verificación

**T** = `src/dominio/*.test.ts` · **U** = `src/utils/textosResumen.test.ts` · **F** = teléfono
(`docs/VERIFICACION.md`) · **C** = consola o Rules Playground.

| Criterio | Verificación |
|---|---|
| CA-A.1.1 – CA-A.1.5 | T `vistaEn.test.ts` · `cambioVistaEn` (los 9 pares de estados) + C/F guardar y ver `vistaEn` |
| CA-A.1.6, CA-A.1.7 | F agregar una película y una serie + C documento con `generos`, `duracionMin` y `directores` |
| CA-A.1.8, CA-A.1.9 | T `datosTmdb.test.ts` · `datosParaGuardar` (sin duración, fuera de rango, más de 10, repetidos, serie) |
| CA-A.1.10 – CA-A.1.12 | C Rules Playground (§7), con capturas |
| CA-A.2.1, CA-A.2.2 | T `resumenAnual.test.ts` · D3 (31 de diciembre a las 23:30 hora local, otros años, otros estados) |
| CA-A.2.3 | T · totales |
| CA-A.2.4, CA-A.2.5 | T · `horas` y `redondearHoras` (2250 → 37,5; 2245 → 37,4; 2247 → 37,5) |
| CA-A.2.6 | T · `peliculasSinDuracion` + F mensaje en la tarjeta (U plural) |
| CA-A.2.7 – CA-A.2.10 | T · `generoTop` y `elegirTop` |
| CA-A.2.11 – CA-A.2.13 | T · `directorTop` + F tarjeta sin datos |
| CA-A.2.14, CA-A.2.15 | T · `obrasPorMes` y `mesTop` + F 12 barras |
| CA-A.2.16 – CA-A.2.18 | T · `destacada` + F tarjeta vacía |
| CA-A.2.19 | F marcar como vista y volver al resumen |
| CA-A.3.1 – CA-A.3.4 | T · `aniosDisponibles` |
| CA-A.3.5, CA-A.3.6 | F selector |
| CA-A.3.7 | T año vacío + F estado vacío e *Ir a Mi lista* |
| CA-A.4.1 | T `obrasSinFecha` + C documento migrado |
| CA-A.4.2, CA-A.4.3 | T `vistaEn.test.ts` · `obrasSinFecha` |
| CA-A.4.4 | C documento migrado sin otros cambios |
| CA-A.4.5, CA-A.4.6 | T `datosTmdb.test.ts` · `obrasPorCompletar` + F progreso |
| CA-A.4.7 | T · `obrasSinDatos` + F aviso |
| CA-A.4.8 | F modo avión durante el completado y volver a abrir |
| CA-A.4.9 | T · `datosVacios` + C documento con listas vacías |
| CA-A.4.10 | F cambiar de año durante el completado |
| CA-A.5.1, CA-A.5.2 | F estados de carga y error |
| CA-A.5.3 | F modo avión: aviso y ninguna escritura (C sin cambios en `actualizadoEn`) |
| CA-A.5.4 | T `obrasSinFecha` + U plural + F aviso |
| CA-A.5.5, CA-A.5.6 | F mensajes por tarjeta y estado vacío |

## 11. Riesgos

- **`Date.now()` local tras D1:** hasta la próxima sincronización, la copia local tiene la hora
  del teléfono, no la del servidor. La diferencia es de segundos y no cambia el año salvo en el
  último minuto del 31 de diciembre.
- **D2 sin conexión:** no se migra (D13). Esas obras quedan fuera del resumen y se avisa (PA-1).
- **Lote de D2:** un `writeBatch` admite 500 operaciones. Basta para una lista personal; si se
  supera, se divide en lotes de 500.
- **Cuota de TMDB (D6):** una petición por obra, de una en una. Con un 429 la obra cuenta como
  fallida y se reintenta en la siguiente apertura.
