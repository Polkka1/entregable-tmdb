# EA · Mi año en cine: épica, historias, criterios y tickets

**Fuente:** `docs/prd/PRD.md`, sección 7: historias en 7.2, decisiones D1 a D13 en 7.3, modelo en
7.4 y puntos abiertos PA-1 a PA-9 en 7.5.

## Épica

**Objetivo:** que el usuario vea en una pestaña el resumen de lo que vio en un año, también con
las obras que marcó como vistas antes de esta épica y sin conexión.

**Alcance:**
- Guardar cuándo se vio cada obra (`vistaEn`) y los datos de TMDB que hoy no se guardan
  (`generos`, `duracionMin`, `directores`).
- Migrar las fechas (D2) y completar los datos (D6) de las obras existentes.
- La pantalla *Mi año en cine*, con selector de año, tarjetas de datos, barras por mes, obra
  destacada y estados de pantalla.

**Fuera de alcance:** revisionados, compartir el resumen, comparar años y estadísticas de obras
que no están en *vista*.

**Cómo se lee la columna "Verificación":**
- **Test:** un caso de Vitest sobre una función pura de `src/dominio/`.
- **Teléfono:** una acción concreta en Expo Go, que se registra en `docs/VERIFICACION.md`.
- **Consola:** se comprueba el documento o la regla en la consola de Firebase.

En los ejemplos, la hora local es la de Ecuador (UTC−5).

## HU-A.1 · Recordar cuándo vi cada obra

Como usuario, quiero que la app recuerde cuándo vi cada obra, para que mi resumen la cuente en el
año correcto.

- **Decisiones:** D1, D5. **Puntos abiertos:** PA-8.
- **Depende de:** ninguna.

| Id | DADO | CUANDO | ENTONCES | Verificación |
|---|---|---|---|---|
| CA-A.1.1 | una obra en *Por ver* o *Viendo* | la cambio a *Vista* y guardo | se guarda `vistaEn` con la hora del servidor (D1) | Test + Consola |
| CA-A.1.2 | una obra en *Vista* con `vistaEn` | la cambio a *Viendo* o *Por ver* y guardo | `vistaEn` vuelve a `null` y la calificación se borra (D1, RF6) | Test + Consola |
| CA-A.1.3 | una obra que estuvo en *Vista* y después pasó a *Por ver* | la vuelvo a marcar como *Vista* | `vistaEn` toma la fecha nueva, posterior a la anterior (D1) | Test + Teléfono |
| CA-A.1.4 | una obra en *Vista* con `vistaEn` del 10 de marzo | cambio solo su calificación o su comentario y guardo | `vistaEn` sigue siendo el 10 de marzo (D1) | Test + Consola |
| CA-A.1.5 | una obra en *Viendo* | cambio solo su comentario y guardo | `vistaEn` sigue en `null` (D1) | Test |
| CA-A.1.6 | una película en la ficha de TMDB, con géneros, duración y director | la agrego a Mi lista | el documento guarda `generos` con los nombres en español, `duracionMin` con los minutos y `directores` con los directores (D5) | Teléfono + Consola |
| CA-A.1.7 | una serie en la ficha de TMDB | la agrego a Mi lista | el documento guarda `generos`, `duracionMin: null` y `directores: []` (D5) | Teléfono + Consola |
| CA-A.1.8 | una película cuya ficha de TMDB no trae duración | la agrego a Mi lista | `duracionMin` es `null` (D5) | Test |
| CA-A.1.9 | una obra con más de 10 géneros o directores en TMDB | la agrego a Mi lista | se guardan los 10 primeros (PA-8) | Test |
| CA-A.1.10 | las reglas de Firestore publicadas | se intenta escribir `duracionMin: -5`, o `vistaEn` en una obra que no está en *Vista* | la escritura se rechaza | Consola (Rules Playground) |
| CA-A.1.11 | un documento creado antes de la épica, sin los campos nuevos | lo edito desde la app | la escritura se acepta: las reglas usan `get(campo, valorPorDefecto)` | Teléfono |
| CA-A.1.12 | las cuentas A y B | B intenta leer la lista de A | la lectura se rechaza: la lista sigue aislada (SEG1) | Consola (Rules Playground) |

## HU-A.2 · Ver mi resumen del año

Como usuario, quiero ver mi resumen del año, para saber cuánto y qué vi.

- **Decisiones:** D3, D7, D8, D9, D10 y D11. **Puntos abiertos:** PA-4, PA-5 y PA-6.
- **Depende de:** HU-A.1.

| Id | DADO | CUANDO | ENTONCES | Verificación |
|---|---|---|---|---|
| CA-A.2.1 | una obra con `vistaEn` el 31 de diciembre de 2025 a las 23:30, hora local (04:30 UTC del 1 de enero de 2026) | pido el resumen de 2025 | la obra cuenta en 2025 y no en 2026 (D3) | Test |
| CA-A.2.2 | obras vistas en 2025 y en 2026, y obras en *Por ver* y *Viendo* | pido el resumen de 2026 | solo cuentan las vistas en 2026; las demás no aparecen en ningún dato (D3) | Test |
| CA-A.2.3 | 3 películas y 2 series vistas en el año | pido el resumen | `totalObras` = 5, `peliculas` = 3 y `series` = 2 | Test |
| CA-A.2.4 | películas de 120, 95 y 2035 minutos vistas en el año, y una serie | pido el resumen | `horas` = 37,5 (2250 min); la serie no suma horas (D7) | Test |
| CA-A.2.5 | películas que suman 2245 min y otras que suman 2247 min | pido cada resumen | las horas son 37,4 y 37,5: redondeo al décimo más cercano (PA-4) | Test |
| CA-A.2.6 | una película vista en el año sin `duracionMin` | pido el resumen | no suma horas, `peliculasSinDuracion` = 1 y la tarjeta de horas lo indica (D7) | Test + Teléfono |
| CA-A.2.7 | 3 obras de Drama y 2 de Comedia, y una de ellas es de Drama y Comedia a la vez | pido el resumen | la obra de los dos géneros suma a ambos y `generoTop` es Drama con 3 obras (D8) | Test |
| CA-A.2.8 | Drama y Comedia con 2 obras cada uno; las calificadas de Drama promedian 3 y las de Comedia 4,5 | pido el resumen | `generoTop` es Comedia (D8) | Test |
| CA-A.2.9 | Drama con 2 obras sin calificar y Comedia con 2 obras, una calificada con 1 | pido el resumen | `generoTop` es Comedia: un género sin calificadas pierde (D8) | Test |
| CA-A.2.10 | "Aventura" y "Acción" empatados en obras y en promedio | pido el resumen | `generoTop` es Acción: orden alfabético sin distinguir tildes (D8, PA-5) | Test |
| CA-A.2.11 | una serie con directores (dato inesperado) y una película con director | pido el resumen | `directorTop` solo considera películas (D9) | Test |
| CA-A.2.12 | dos directores empatados en películas | pido el resumen | se desempata como en D8: promedio y después alfabético (D9) | Test |
| CA-A.2.13 | ninguna película vista en el año tiene director | pido el resumen | `directorTop` es `null` y la tarjeta dice que no hay datos suficientes (D9) | Test + Teléfono |
| CA-A.2.14 | obras vistas en marzo (2), julio (3) y noviembre (1) | pido el resumen | `obrasPorMes` tiene 12 posiciones, con 0 en los meses sin obras, y `mesTop` es julio (D10) | Test + Teléfono |
| CA-A.2.15 | marzo y octubre con 3 obras cada uno | pido el resumen | `mesTop` es octubre: gana el más reciente (D10) | Test |
| CA-A.2.16 | obras calificadas con 5, 4 y 5 | pido el resumen | `destacada` es la de 5 con `vistaEn` más reciente (D11) | Test |
| CA-A.2.17 | dos obras con 5 y el mismo `vistaEn` | pido el resumen | `destacada` es la primera por orden alfabético del título (PA-6) | Test |
| CA-A.2.18 | obras vistas en el año, ninguna calificada | pido el resumen | `destacada` es `null` y la tarjeta invita a calificar (D11) | Test + Teléfono |
| CA-A.2.19 | el resumen del año abierto | marco como *Vista* una obra de Mi lista y vuelvo a *Mi año en cine* | el total, el mes y las demás tarjetas ya la incluyen | Teléfono |

## HU-A.3 · Cambiar de año

Como usuario, quiero cambiar de año, para comparar lo que vi en otros años.

- **Decisiones:** D4, D12.
- **Depende de:** HU-A.2.

| Id | DADO | CUANDO | ENTONCES | Verificación |
|---|---|---|---|---|
| CA-A.3.1 | obras vistas en 2024 y 2026, con 2026 como año actual | pido los años disponibles | son [2026, 2024], del más reciente al más antiguo y sin repetir (D4) | Test |
| CA-A.3.2 | obras vistas solo en 2023, con 2026 como año actual | pido los años disponibles | son [2026, 2023]: el año actual siempre aparece (D4) | Test |
| CA-A.3.3 | ninguna obra vista | pido los años disponibles | es solo el año actual (D4) | Test |
| CA-A.3.4 | obras en *Por ver* y *Viendo* en 2022 | pido los años disponibles | 2022 no aparece (D4) | Test |
| CA-A.3.5 | varios años con obras | abro *Mi año en cine* | el selector está en el año actual (D4) | Teléfono |
| CA-A.3.6 | el selector abierto | elijo otro año | todas las tarjetas muestran el resumen de ese año | Teléfono |
| CA-A.3.7 | un año sin obras vistas (por ejemplo, el actual en enero) | lo elijo | se ve un estado vacío con el botón *Ir a Mi lista*, que abre la pestaña Mi lista (D12) | Test (`totalObras` = 0) + Teléfono |

## HU-A.4 · Ver mi resumen con obras anteriores a la épica

Como usuario, quiero ver mi resumen aunque mis obras sean anteriores a esta épica, para no perder
lo que ya registré.

- **Decisiones:** D2, D6. **Puntos abiertos:** PA-2, PA-3, PA-7 y PA-9.
- **Depende de:** HU-A.1.

| Id | DADO | CUANDO | ENTONCES | Verificación |
|---|---|---|---|---|
| CA-A.4.1 | una obra en *Vista* sin `vistaEn`, con `actualizadoEn` del 10 de junio de 2025 | abro *Mi año en cine* con conexión | en Firestore queda `vistaEn` = 10 de junio de 2025 y la obra cuenta en 2025 (D2, PA-7) | Test + Consola |
| CA-A.4.2 | una obra en *Vista* que ya tiene `vistaEn` | abro *Mi año en cine* | su `vistaEn` no cambia: la migración se hace una sola vez (D2) | Test |
| CA-A.4.3 | obras en *Por ver* y *Viendo* sin `vistaEn` | abro *Mi año en cine* | no se migran (D2) | Test |
| CA-A.4.4 | una obra migrada | reviso su documento | estado, calificación, comentario y datos de TMDB siguen iguales (D2) | Consola |
| CA-A.4.5 | 3 obras vistas en el año elegido sin el campo `generos` | abro el resumen con conexión | se completan desde TMDB de una en una y se ve el progreso ("Completando datos: 2 de 3") (D6, PA-2) | Test (qué obras) + Teléfono |
| CA-A.4.6 | obras sin datos vistas en otro año | abro el resumen del año actual | no se completan hasta que elijo su año (D6) | Test |
| CA-A.4.7 | una obra para la que TMDB falla | termina el completado | la obra cuenta en el total pero no en horas, género ni director, y el resumen dice "1 obra quedó sin datos" (D6) | Test + Teléfono |
| CA-A.4.8 | una obra que falló por un error de red | vuelvo a abrir el resumen con conexión | se vuelve a intentar completarla (PA-3) | Teléfono |
| CA-A.4.9 | una obra que ya no existe en TMDB (404) | termina el completado | se guarda con listas vacías y no se vuelve a consultar (PA-3) | Test |
| CA-A.4.10 | el completado en curso | elijo otro año en el selector | se detiene el del año anterior, se conserva lo ya guardado y empieza el del año nuevo (PA-9) | Teléfono |

## HU-A.5 · Entender un resumen vacío o incompleto

Como usuario, quiero entender un resumen vacío o incompleto, para saber si falta algo y por qué.

- **Decisiones:** D6, D7, D9, D11, D12 y D13. **Puntos abiertos:** PA-1.
- **Depende de:** HU-A.2 y HU-A.4.

| Id | DADO | CUANDO | ENTONCES | Verificación |
|---|---|---|---|---|
| CA-A.5.1 | la lista o la migración todavía se están cargando | abro *Mi año en cine* | se ve un indicador de carga con un mensaje | Teléfono |
| CA-A.5.2 | la migración de fechas falla por un error del servidor | abro *Mi año en cine* | se informa el error con *Reintentar*, y al tocarlo se vuelve a intentar | Teléfono |
| CA-A.5.3 | el teléfono en modo avión y una copia local de la lista | abro *Mi año en cine* | el resumen se calcula con la copia local, se ve el aviso sin conexión y no se hace ninguna petición a TMDB ni ninguna escritura en Firestore (D13) | Teléfono |
| CA-A.5.4 | sin conexión y 2 obras en *Vista* sin `vistaEn` | abro *Mi año en cine* | esas obras no cuentan en ningún año y el aviso dice "2 obras vistas aún no tienen fecha" (PA-1) | Test + Teléfono |
| CA-A.5.5 | un año con obras sin datos, películas sin duración, sin directores o sin calificaciones | abro su resumen | cada tarjeta afectada muestra su propio mensaje (D6, D7, D9, D11) | Teléfono |
| CA-A.5.6 | un año sin obras vistas | lo elijo | se ve el estado vacío de CA-A.3.7 y no tarjetas en cero (D12) | Teléfono |

## Cobertura de las decisiones

| Decisión | Criterios |
|---|---|
| D1 | CA-A.1.1 a CA-A.1.5 |
| D2 | CA-A.4.1 a CA-A.4.4 |
| D3 | CA-A.2.1, CA-A.2.2 |
| D4 | CA-A.3.1 a CA-A.3.5 |
| D5 | CA-A.1.6 a CA-A.1.8 |
| D6 | CA-A.4.5 a CA-A.4.7 |
| D7 | CA-A.2.4 a CA-A.2.6 |
| D8 | CA-A.2.7 a CA-A.2.10 |
| D9 | CA-A.2.11 a CA-A.2.13 |
| D10 | CA-A.2.14, CA-A.2.15 |
| D11 | CA-A.2.16 a CA-A.2.18 |
| D12 | CA-A.3.7, CA-A.5.6 |
| D13 | CA-A.5.3, CA-A.5.4 |
| PA-1 a PA-9 | CA-A.5.4 (PA-1), CA-A.4.5 (PA-2), CA-A.4.8 y CA-A.4.9 (PA-3), CA-A.2.5 (PA-4), CA-A.2.10 (PA-5), CA-A.2.17 (PA-6), CA-A.4.1 (PA-7), CA-A.1.9 (PA-8), CA-A.4.10 (PA-9) |

## Tickets

Los tickets se implementan según la spec `docs/specs/01-mi-anio-en-cine.md` (T-A01). En cada
ticket de código, el commit `docs:` va antes, y en el dominio el commit `test:` (en rojo) va antes
que el `feat:`.

**Definition of Done común a todos los tickets de código:**
- [ ] `npm test` y `npx tsc --noEmit` pasan, y `npx expo lint` no da errores.
- [ ] Sin `any` injustificados y sin colores ni tamaños fuera de `src/tema/`.
- [ ] Las pantallas no llaman a Firebase ni a TMDB.
- [ ] El cambio se revisó antes del commit y el mensaje sigue la convención de AGENTS.md.

### T-A01 · Spec de la épica
- **Historias:** todas. **Tipo:** Documentación. **Hito:** 3.
- **Descripción:** escribir `docs/specs/01-mi-anio-en-cine.md`: alcance, fuera de alcance, cambios
  al modelo, funciones de dominio, servicios, reglas de Firestore, componentes elegidos (citando
  DESIGN.md sin copiar valores), tickets y una tabla criterio → verificación.
- **Dependencias:** DESIGN.md (Hito 2).
- **Definition of Done:**
  - [ ] Cada criterio CA-A.x.y tiene su verificación asignada.
  - [ ] Cada función de dominio tiene firma, entradas, salidas y las decisiones que aplica.
  - [ ] Commit `docs:` antes de cualquier código de la épica.

### T-A02 · Tests del dominio en rojo
- **Historias:** HU-A.1 a HU-A.5. **Tipo:** Test. **Hito:** 3.
- **Descripción:** tests de Vitest para `resumenAnual`, `aniosDisponibles` y las funciones puras
  de D1, D2 y D6 (qué obras se migran, cuáles se completan, qué cambia en `vistaEn`), a partir de
  la spec.
- **Dependencias:** T-A01.
- **Definition of Done:**
  - [ ] Hay un test por cada criterio con verificación "Test", incluidos los límites de D3 a D11.
  - [ ] Los tests no dependen del día ni de la zona horaria de la máquina que los ejecuta.
  - [ ] Commit `test:` con los tests en rojo, antes de la implementación.

### T-A03 · Dominio del resumen anual
- **Historias:** HU-A.2, HU-A.3. **Tipo:** Dominio. **Hito:** 3.
- **Descripción:** implementar `src/dominio/resumenAnual.ts` y sus funciones auxiliares hasta que
  pasen los tests de T-A02.
- **Dependencias:** T-A02.
- **Definition of Done:**
  - [ ] Todos los tests de T-A02 pasan sin modificarlos.
  - [ ] `src/dominio/` no importa `react-native`, `firebase` ni servicios, y no llama a `new Date()` sin argumentos ni a `Date.now()`.

### T-A04 · Modelo de datos y servicios
- **Historias:** HU-A.1. **Tipo:** Datos. **Hito:** 3.
- **Descripción:** sumar los campos nuevos a `ItemLista`; leerlos en `aItemLista`; guardar los
  datos de TMDB al agregar (D5, incluidos los directores desde `credits.crew`); registrar y borrar
  `vistaEn` al cambiar el estado (D1); guardar en la copia de AsyncStorage los campos nuevos que
  necesita D13.
- **Dependencias:** T-A03.
- **Definition of Done:**
  - [ ] CA-A.1.1 a CA-A.1.9 verificados.
  - [ ] Una copia de AsyncStorage antigua, sin los campos nuevos, no rompe la app.

### T-A05 · Migración de fechas y completado de datos
- **Historias:** HU-A.4, HU-A.5. **Tipo:** Datos. **Hito:** 3.
- **Descripción:** al abrir el resumen con conexión, migrar `vistaEn` (D2) y completar desde TMDB,
  de una en una, las obras del año elegido sin datos (D6), con progreso y sin hacerlo sin conexión
  (D13).
- **Dependencias:** T-A04.
- **Definition of Done:**
  - [ ] CA-A.4.1 a CA-A.4.10 y CA-A.5.3 verificados.
  - [ ] Un documento con los campos nuevos se ve en la consola de Firebase (captura en `docs/`).

### T-A06 · Reglas de Firestore
- **Historias:** HU-A.1, HU-A.4. **Tipo:** Seguridad. **Hito:** 3.
- **Descripción:** integrar en `esItemValido` la validación de los campos nuevos (PRD 7.4) y
  permitir en `update` los cambios de `vistaEn`, `generos`, `duracionMin` y `directores`.
  Publicarlas y guardar la copia en `firestore.rules`.
- **Dependencias:** T-A01.
- **Definition of Done:**
  - [ ] CA-A.1.10 a CA-A.1.12 verificados en el Rules Playground, con capturas.
  - [ ] Una escritura con `duracionMin: -5` es rechazada.
  - [ ] La copia del repositorio coincide con las reglas publicadas.

### T-A07 · Tokens de diseño
- **Historias:** HU-A.2, HU-A.5. **Tipo:** Diseño. **Hito:** 3.
- **Descripción:** crear en `src/tema/` los tokens de DESIGN.md: color, tipografía, espacio, radio
  y alto mínimo táctil.
- **Dependencias:** DESIGN.md.
- **Definition of Done:**
  - [ ] Los valores coinciden con el brand board.

### T-A08 · Componentes de la épica
- **Historias:** HU-A.2, HU-A.3, HU-A.5. **Tipo:** Interfaz. **Hito:** 4.
- **Descripción:** tarjeta de dato, barras por mes (con `View`, sin librerías de gráficas),
  tarjeta de obra destacada, selector de año y estados de pantalla, según DESIGN.md.
- **Dependencias:** T-A07.
- **Definition of Done:**
  - [ ] Todo elemento tocable mide al menos 44 px y tiene etiqueta de accesibilidad.
  - [ ] Los componentes solo usan los tokens de `src/tema/`.

### T-A09 · Pantalla Mi año en cine
- **Historias:** HU-A.2 a HU-A.5. **Tipo:** Interfaz. **Hito:** 4.
- **Descripción:** pestaña nueva y pantalla armada con los componentes de T-A08; los estados de
  carga, vacío, error, sin conexión y datos faltantes.
- **Dependencias:** T-A03, T-A05 y T-A08.
- **Definition of Done:**
  - [ ] Los criterios con verificación "Teléfono" de HU-A.2, HU-A.3 y HU-A.5 se cumplen.
  - [ ] La pantalla no calcula ninguna regla: todo sale de `src/dominio/`.

### T-A10 · Pantallas del Proyecto 3 con tokens
- **Historias:** —. **Tipo:** Interfaz. **Hito:** 4.
- **Descripción:** pasar las pantallas y los componentes del Proyecto 3 a los tokens de
  `src/tema/` (auditoría A-04 y A-08).
- **Dependencias:** T-A07.
- **Definition of Done:**
  - [ ] El test de colores fijos pasa.
  - [ ] La atribución de TMDB sigue visible y es menos prominente que la marca de la app.

### T-A11 · Verificación humana, auditoría final y documentación
- **Historias:** todas. **Tipo:** Verificación. **Hito:** 4.
- **Descripción:** llenar a mano `docs/VERIFICACION.md` probando en el teléfono; cerrar
  `docs/AUDITORIA.md`; actualizar el README y escribir `docs/IA.md`.
- **Dependencias:** T-A09 y T-A10.
- **Definition of Done:**
  - [ ] Todos los criterios tienen un resultado obtenido; lo que falló se corrigió o quedó anotado.
  - [ ] Capturas: resumen con datos, resumen vacío, `npm test` en verde y un documento con los campos nuevos.
  - [ ] Una persona nueva puede instalar la app y correr los tests siguiendo el README.
