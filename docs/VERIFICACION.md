# Verificación · Mi año en cine

**Cómo se verifica:** la lógica (D1 a D13 y PA-1 a PA-9) la comprueban los tests de Vitest. La
experiencia se comprueba a mano en el teléfono, con Expo Go. La columna **Resultado obtenido** la
llena el estudiante durante la prueba: ✅ si coincide con lo esperado, o ❌ con lo que pasó.

**Teléfono y versión:** ____________________ · **Fecha:** ____________ · **Cuenta:** cuenta1

## 1. Verificación automática

| Comando | Resultado esperado | Resultado obtenido |
|---|---|---|
| `npm test` | 7 archivos y 101 tests en verde (dominio, textos, RF6/RF4, colores fijos y tamaños sueltos) | |
| `npx tsc --noEmit` | Sin errores | |
| `npx expo lint` | Sin errores ni advertencias | |

Captura: `docs/npm-test-verde.png`.

## 2. Reglas de Firestore (consola)

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| CA-A.1.10 | Rules Playground: `update` con `duracionMin: -5` sobre una obra real | Denegado en `camposNuevosValidos` (`docs/reglas-duracion-negativa.png`) | |
| CA-A.1.10 | Rules Playground: `update` con `vistaEn` sobre una obra en *Por ver* | Denegado (`docs/reglas-vistaen-por-ver.png`) | |
| CA-A.1.12 | Rules Playground: `get` de la lista de A autenticado como B | Denegado (`docs/reglas-cuenta2-denegada-e3.png`); A sí puede leer (`docs/reglas-dueno-permitido.png`) | |

## 3. En el teléfono

Antes de empezar: cierra Expo Go y vuelve a abrir la app, para que cargue la versión nueva.

### HU-A.1 · Fecha de visionado y datos de TMDB

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| CA-A.1.6 | Buscar una película (por ejemplo *Dune: Parte dos*) → *Agregar a mi lista* → abrir su documento en la consola | El documento tiene `generos` en español, `duracionMin` y `directores` (`docs/firestore-campos-nuevos.png`) | |
| CA-A.1.7 | Agregar una serie y ver su documento | `generos` con datos, `duracionMin: null`, `directores: []` | |
| CA-A.1.1 | Mi lista → la película → estado *Vista* → *Guardar* | En la consola aparece `vistaEn` con la hora de ahora | |
| CA-A.1.4 | Cambiar solo las estrellas o el comentario de esa obra y guardar | `vistaEn` no cambia | |
| CA-A.1.2 | Cambiar la obra a *Por ver* y guardar | `vistaEn` es `null` y la calificación se borra | |
| CA-A.1.3 | Volver a marcarla como *Vista* | `vistaEn` toma la hora nueva | |
| CA-A.1.11 | Editar el comentario de una obra agregada antes de la épica | Se guarda sin error | |

### HU-A.4 · Obras anteriores a la épica

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| CA-A.4.1 | Con una obra *Vista* antigua (sin `vistaEn`), abrir la pestaña **Mi año** con conexión | En la consola, la obra recibe `vistaEn` = su `actualizadoEn` anterior, y cuenta en ese año | |
| CA-A.4.4 | Revisar ese documento | Estado, calificación, comentario y datos de TMDB siguen iguales | |
| CA-A.4.5 | Con obras vistas del año sin `generos` (anteriores a la épica), abrir **Mi año** | Se ve "Completando datos · n de m obras"; al terminar, las obras tienen `generos` en la consola | |
| CA-A.4.7 | Si alguna obra no se pudo completar | Aviso "1 obra quedó sin datos de TMDB: …" | |
| CA-A.4.8 | Activar el modo avión durante el completado, salir, desactivarlo y reiniciar la app | Las obras que fallaron se vuelven a intentar | |
| CA-A.4.10 | Cambiar de año mientras se completan datos | Se detiene el del año anterior y sigue con el nuevo | |

### HU-A.2 · Resumen del año

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| CA-A.2.3 | Abrir **Mi año** en el año actual | Total grande ("n obras") y "x películas · y series" correctos | |
| CA-A.2.16 | Mirar la obra destacada | Es la de mayor calificación del año, con póster, estrellas y "vista el …" | |
| CA-A.2.18 | Con un año sin obras calificadas | La tarjeta invita a calificar, con *Ir a Mi lista* | |
| CA-A.2.14 | Mirar las barras | Hay 12 meses; los meses en 0 tienen una barra mínima; el mes más activo va en dorado y figura en el encabezado | |
| CA-A.2.6 | Si hay películas sin duración | La tarjeta de horas dice "n película(s) sin duración no suma(n) horas." | |
| CA-A.2.13 | Si ninguna película tiene director | La tarjeta Director dice "Aún no hay datos suficientes" | |
| CA-A.2.19 | Con **Mi año** abierto, ir a Mi lista, marcar otra obra como *Vista* y volver | El total, el mes y las tarjetas ya la incluyen | |

### HU-A.3 · Cambiar de año

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| CA-A.3.5 | Abrir **Mi año** | El selector está en el año actual | |
| CA-A.3.1 | Mirar los años del selector | Solo años con obras vistas, más el actual, del más reciente al más antiguo | |
| CA-A.3.6 | Elegir otro año | Todas las tarjetas cambian a ese año | |
| CA-A.3.7 | Elegir un año sin obras vistas (o el actual, si no hay) | "Aún no hay obras vistas en {año}." con *Ir a Mi lista*, que abre Mi lista (`docs/resumen-vacio.png`) | |

### HU-A.5 · Estados

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| CA-A.5.1 | Abrir **Mi año** justo después de iniciar la app | "Preparando tu año…" con indicador | |
| CA-A.5.3 | Modo avión → reiniciar la app → abrir **Mi año** | El resumen sale de la copia local, con el aviso sin conexión; nada cambia en la consola | |
| CA-A.5.4 | Igual que la anterior, con alguna obra vista sin fecha | El aviso dice cuántas obras vistas aún no tienen fecha | |
| CA-A.5.2 | (Difícil de provocar) Un error del servidor al migrar | Mensaje "No pudimos preparar tu resumen." con *Reintentar* | |

### Proyecto 3 con el diseño nuevo

| Comprobación | Resultado esperado | Resultado obtenido |
|---|---|---|
| Buscar, Detalle, Mi lista, Editar y Login | Se ven con la paleta nueva (acento violeta, estados en color con texto), sin textos cortados | |
| Editar mi entrada | El selector de estado rellena el chip con el color de su estado; las estrellas son doradas | |
| Acerca de | Wordmark con "Cartelera" en violeta; logo de TMDB más pequeño, con el aviso | |
| Quitar una obra y cerrar sesión | Siguen pidiendo confirmación | |

**Captura del resumen con datos:** `docs/resumen-con-datos.png`.

## 4. Lo que falló y cómo quedó

| Criterio | Qué pasó | Decisión (corregido / anotado en la auditoría) |
|---|---|---|
| | | |
