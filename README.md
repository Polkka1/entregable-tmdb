# Mi Cartelera Personal

App móvil (React Native + Expo + TypeScript) para buscar películas y series en
[TMDB](https://www.themoviedb.org/), agregarlas a una lista personal y organizarlas por estado
(**Por ver**, **Viendo**, **Vista**), con calificación y comentario propios.

Proyecto de integración de **DIM 4080 Tecnologías Emergentes (USFQ)**: Firebase Auth, Firestore
y una API externa pública en una sola app.

## Objetivo

Construir una app móvil que combine autenticación con Firebase Auth, datos propios en Firestore
y la API pública de TMDB, escrita en TypeScript y ejecutable en un dispositivo con Expo Go.

## Descripción

1. El usuario se registra o inicia sesión.
2. Busca una película o serie por título.
3. Abre su ficha: póster, sinopsis, calificación de TMDB y elenco.
4. La agrega a su lista con estado inicial **Por ver**. No se permiten duplicados.
5. Cambia el estado, la califica de 1 a 5 (solo si está **Vista**) y la comenta (hasta 500 caracteres).
6. Su lista es privada. Se guarda en Firestore y queda una copia en el dispositivo para verla sin conexión.

## Pantallas

| Pantalla | Contenido | Navegación |
| --- | --- | --- |
| Login / Registro | Formulario con validación y alternancia entre ambos modos | Visible solo sin sesión |
| Buscar | Campo de búsqueda y resultados con carátula, título y año | Pestaña inferior |
| Detalle de TMDB | Póster, sinopsis, calificación, elenco y botón **Agregar a mi lista** | Pantalla de la pila |
| Mi lista | Filtros por estado y tipo; tarjetas con calificación personal | Pestaña inferior |
| Editar mi entrada | Selector de estado, calificación, comentario y botón **Quitar** | Modal de la pila |
| Acerca de | Atribución y logo de TMDB, datos de la app y cerrar sesión | Pestaña inferior |

## Estado del desarrollo

| Paso | Contenido | Estado |
| --- | --- | --- |
| 1 | Proyecto Expo + TypeScript, estructura de carpetas, navegación | ✅ |
| 1 | Firebase Auth (login, registro, sesión persistente) | ✅ |
| 2 | Servicio de TMDB, pantallas Buscar y Detalle | ✅ |
| 3 | Mi lista y Editar mi entrada | ✅ |
| 3 | Firestore, caché en AsyncStorage y modo sin conexión | ✅ |
| 3 | Reglas de seguridad ([`firestore.rules`](firestore.rules)) | ✅ Falta probarlas con dos cuentas |
| — | Capturas en `docs/` | ⏳ Pendiente |

## Requisitos

- Node.js 20 o superior
- App **Expo Go** en el teléfono (o un emulador Android / simulador iOS)
- Una cuenta de TMDB con acceso a la API (uso no comercial)
- Un proyecto de Firebase con una app web registrada

### Configurar Firebase

1. **Authentication → Método de acceso:** habilitar **Correo electrónico/contraseña**.
2. **Firestore Database:** crear la base de datos (modo producción).
3. **Firestore Database → Reglas:** pegar el contenido de [`firestore.rules`](firestore.rules) y publicar.
4. **Configuración del proyecto → Tus apps → App web:** copiar los valores de `firebaseConfig` al `.env`.

## Instalación

```bash
git clone <url-del-repositorio>
cd DeberPeliculas
npm install
cp .env.example .env      # luego completa los valores
npm run dev
```

Escanea el código QR con Expo Go (Android) o con la cámara (iOS).

### Variables de entorno

| Variable | Descripción |
| --- | --- |
| `EXPO_PUBLIC_TMDB_TOKEN` | **API Read Access Token** de TMDB ([Ajustes → API](https://www.themoviedb.org/settings/api)). Se envía como `Authorization: Bearer <token>`. |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | `apiKey` de `firebaseConfig` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `appId` |

Para probar el token fuera de la app:

```bash
curl -H "Authorization: Bearer $EXPO_PUBLIC_TMDB_TOKEN" \
  "https://api.themoviedb.org/3/search/multi?query=matrix&language=es-ES"
```

> **Seguridad de la clave:** todo valor `EXPO_PUBLIC_` queda incluido en el paquete de la app y
> alguien podría extraerlo. Para este proyecto no comercial el riesgo se acepta: el token solo
> permite leer el catálogo público de TMDB y el archivo `.env` no se sube al repositorio
> (está en `.gitignore`). La solución de fondo sería un proxy en un servidor propio que guarde
> el token. La configuración web de Firebase no es secreta (identifica el proyecto); lo que
> protege los datos son las reglas de Firestore.

### Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo de Expo |
| `npm run typecheck` | Revisa los tipos con el compilador de TypeScript |
| `npm run lint` | Revisa el código con ESLint |

## Arquitectura

| Capa | Herramienta | Responsabilidad |
| --- | --- | --- |
| Interfaz | React Native + Expo (TypeScript) | Pantallas y componentes |
| Navegación | React Navigation (pila y pestañas) | Flujo entre pantallas; Login condicional según sesión |
| Estado global | Context API | Usuario, lista personal y acciones |
| Servicios | `src/services/` | Único lugar donde se llama a Firebase y a TMDB |
| API externa | TMDB v3 | Catálogo de películas y series |
| Autenticación | Firebase Auth | Cuentas de usuario; sesión guardada en AsyncStorage |
| Base de datos | Firestore | Lista personal, aislada por usuario |
| Caché local | AsyncStorage | Copia de la lista para uso sin conexión |

```
App.tsx                     Proveedores y navegación raíz
src/
├── components/             Componentes reutilizables (Poster, Boton, Chip, Estrellas, TmdbLogo…)
├── config/env.ts           Lectura de variables de entorno
├── context/                SesionContext (usuario) y CarteleraContext (lista y acciones)
├── hooks/                  usePeticion<T>, useBusqueda, useDebounce
├── navigation/             RootNavigator (pila) y TabsNavigator (pestañas)
├── screens/                Una pantalla por archivo
├── services/
│   ├── firebase.ts         Inicialización de Firebase (Auth con persistencia y Firestore)
│   ├── authService.ts      Registro, inicio y cierre de sesión; errores traducidos
│   ├── listaService.ts     CRUD de usuarios/{uid}/mi_lista con serverTimestamp y tiempo máximo
│   ├── cacheService.ts     Copia de la lista en AsyncStorage
│   ├── http.ts             fetch genérico con tiempo máximo, cancelación y errores en español
│   └── tmdbService.ts      buscar, obtenerDetalle, construirUrlImagen
├── theme/tema.ts           Colores, espacios y alto mínimo tocable (44 px)
├── types/                  Tipos de dominio, de la API de TMDB, de navegación y EstadoPeticion<T>
└── utils/                  Funciones puras (formato, itemId, regla de calificación, assertNever)
firestore.rules             Reglas de seguridad publicadas en Firestore
```

### Modelo de datos en Firestore

Ruta: `usuarios/{uid}/mi_lista/{itemId}`. El `itemId` combina tipo y id de TMDB
(`movie_550`, `tv_1399`), lo que impide guardar la misma obra dos veces.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `tmdbId` | número | Id de la obra en TMDB |
| `tipo` | `'movie'` | `'tv'` | Película o serie |
| `titulo` | texto | Copiado de TMDB al agregar |
| `anio` | texto | Año de estreno o primera emisión |
| `posterPath` | texto o nulo | Solo la ruta; la URL se arma al mostrarla |
| `estado` | `'por_ver'` | `'viendo'` | `'vista'` | Estado de visionado |
| `calificacionPersonal` | número o nulo | 1 a 5; solo si el estado es `vista` |
| `comentario` | texto | Hasta 500 caracteres |
| `agregadoEn` / `actualizadoEn` | marca de tiempo | `serverTimestamp()` |

Las reglas permiten leer y escribir solo al dueño (`request.auth.uid == uid`) y validan en el
servidor los campos permitidos, sus tipos, el formato del `itemId`, el límite del comentario,
la regla "solo se califica si está vista" y que al editar no cambien los datos copiados de TMDB.

### Modo sin conexión

Al abrir Mi lista se muestra primero la copia de AsyncStorage y luego se reemplaza con la de
Firestore. Si no hay internet (detectado con `expo-network`) o el servidor no responde en 10 s,
se mantiene la última copia con un aviso y los cambios quedan bloqueados hasta reconectar; al
volver la conexión la lista se sincroniza sola.

### Integración con TMDB

- **URL base:** `https://api.themoviedb.org/3`, con textos en español (`language=es-ES`).
- **Búsqueda:** `/search/multi`, que combina películas y series; las personas se descartan.
  Los resultados se paginan con *scroll* infinito.
- **Detalle:** `/movie/{id}` o `/tv/{id}` con `append_to_response=credits`, para traer el
  elenco en la misma petición.
- **Imágenes:** la URL se arma como `base_url + file_size + file_path`. `base_url` y los
  tamaños vienen de `/configuration`, que se pide una sola vez. Las listas usan `w185` y el
  detalle `w500`.
- **Casos límite:** sin póster (se muestra una imagen de relleno), sin sinopsis (texto
  alternativo), sin elenco, búsqueda sin resultados, sin conexión, tiempo agotado (10 s),
  token inválido (401) y límite de peticiones (429).

## Créditos y términos de uso

<img src="https://www.themoviedb.org/assets/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" width="120" />

This product uses the TMDB API but is not endorsed or certified by TMDB.

Uso gratuito y solo no comercial, según los [términos de TMDB](https://www.themoviedb.org/api-terms-of-use).

## Uso de IA

Este proyecto usa asistencia de IA (Claude Code) para generar código, que el equipo revisa y
debe poder explicar. Detalle en la bitácora de IA.
