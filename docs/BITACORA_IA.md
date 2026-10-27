# Bitácora de uso de IA

**Proyecto:** Mi Cartelera Personal (Entregable 2, DIM 4080 Tecnologías Emergentes, USFQ)
**Autor:** Nikolai Enríquez
**Herramienta:** Claude Code (modelo Claude Opus 5.5) dentro de VS Code
**Fecha de Entrega:** 27 de octubre de 2026

## Cómo se usó

La IA se usó como asistente de programación. Recibía el enunciado y la rúbrica en PDF, proponía y
escribía el código, y lo verificaba con el compilador de TypeScript, ESLint y `expo-doctor`. Las
cuentas de servicio, la configuración en la consola de Firebase, las pruebas en el teléfono y las
pruebas de las reglas las hice yo.

## Sesiones

### 1. Esqueleto del frontend e integración con TMDB

**Lo que pedí:** el esqueleto del frontend y la conexión con TMDB siguiendo el enunciado, todavía
sin Firebase.

**Lo que hizo la IA:**
- Creó el proyecto con `create-expo-app` (plantilla `blank-typescript`, Expo SDK 58) e instaló las
  dependencias con `npx expo install`.
- Organizó el código en capas: `types/`, `services/`, `hooks/`, `context/`, `navigation/`,
  `screens/`, `components/`, `utils/` y `theme/`.
- Definió los tipos del enunciado (`EstadoVisto`, `TipoMedio`, `ItemLista`, `EstadoPeticion<T>`,
  `ETIQUETA_ESTADO`) y separó los tipos crudos de la API de TMDB de los tipos que usan las pantallas.
- Escribió `tmdbService.ts` (búsqueda con `/search/multi`, detalle con
  `append_to_response=credits` y URLs de imágenes armadas con `/configuration`) y `http.ts`
  (tiempo máximo, cancelación y errores en español).
- Creó las pantallas Buscar, Detalle, Mi lista, Editar mi entrada y Acerca de, con la lista
  todavía en memoria.
- Incluyó el logo oficial de TMDB como SVG, copiado tal cual del sitio de TMDB.

**Decisiones y correcciones durante la sesión:**
- La plantilla de Expo traía un `AGENTS.md` que recomendaba Expo Router. La IA usó React
  Navigation porque lo exige el enunciado, y actualizó ese archivo.
- Armó la consulta de la URL a mano porque `URLSearchParams` no está completo en React Native.
- Quitó el contador de resultados, porque el total que devuelve TMDB incluye personas, que la app
  descarta.
- ESLint marcó la regla `react-hooks/set-state-in-effect` en `usePeticion` y `useBusqueda`. La IA
  cambió el diseño: cada resultado guarda qué petición lo produjo, y el estado "cargando" se
  calcula en lugar de asignarse dentro del efecto.
- Probó el servicio de TMDB con respuestas simuladas, sin token real: la búsqueda descarta
  personas, la falta de fecha o de sinopsis se maneja y un 404 se traduce.

### 2. GitHub, Firebase y reglas de seguridad

**Lo que pedí:** subir el proyecto al repositorio, conectar Firebase con la configuración de mi
proyecto y generar las reglas de Firestore.

**Lo que hizo la IA:**
- Subió el código a GitHub en dos commits y comprobó que `.env` no se incluyera.
- Guardó la configuración de Firebase en `.env` (fuera del repositorio) y la documentó en
  `.env.example` sin valores.
- Escribió `firebase.ts` (Auth con sesión persistente en AsyncStorage), `authService.ts` (errores
  traducidos), `listaService.ts` (CRUD con `serverTimestamp` y un tiempo máximo de 10 s) y
  `cacheService.ts` (copia de la lista en AsyncStorage).
- Creó la pantalla de Login/Registro, la navegación condicional según la sesión, el aviso sin
  conexión con `expo-network` y el botón para cerrar sesión.
- Escribió `firestore.rules`, que aíslan los datos por usuario y validan en el servidor los campos,
  sus tipos, el formato del itemId, la regla "solo se califica si está vista" y que al editar no
  cambien los datos copiados de TMDB.

**Problemas encontrados y cómo se resolvieron:**
- TypeScript no encontraba `getReactNativePersistence`, porque el paquete `@firebase/auth` declara
  primero los tipos web. La solución habitual (un alias `paths` en `tsconfig.json`) habría roto el
  empaquetado, porque Metro también usa esos alias. Se resolvió declarando el tipo en
  `src/types/firebase-auth-rn.d.ts`, y se confirmó que el paquete de Android usa la versión de
  React Native.
- Sin conexión, las escrituras de Firestore quedan esperando indefinidamente. Por eso cada
  operación tiene un tiempo máximo y los cambios se bloquean mientras no hay internet.
- La IA no pudo probar las reglas con el emulador porque la máquina no tiene Java. Las probé yo en
  el Rules Playground (ver más abajo).

### 3. Capturas y documentación

**Lo que pedí:** organizar las capturas, actualizar el README y redactar este borrador.

**Lo que hizo la IA:** movió las capturas a `docs/`, las agregó al README y redactó este borrador,
que luego revisé y completé.

## Lo que hice yo

- Creé la cuenta de TMDB y obtuve el token de la API.
- Creé el proyecto de Firebase, habilité el inicio de sesión con correo y contraseña, creé la base
  de datos de Firestore y publiqué las reglas.
- Probé la app en iOS con Expo Go: registro, inicio de
  sesión, búsqueda, detalle, agregar, editar y quitar obras, y el modo sin conexión.
- En el Rules Playground comprobé que la lista de cuenta1 no se puede leer sin autenticación ni
  autenticado como cuenta2.
- Tomé las capturas de `docs/`.

## Revisión del código

El codigo fue sorprendentemente sin errores y no requirió una revisión mayor, la conexión a la API, la estructura
y el funcionamiento son correctos, los únicos detalles son estéticos del front-end que se pueden corregir
rápidamente con prompts.

## Reflexión sobre el uso de IA

Me da miedo lo eficaz y automática que es la IA, al punto de casi no requerir ayuda humana para completar 
proyectos cada vez más complejos y sofisticados. 
