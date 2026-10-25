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
| 1 | Firebase Auth (login, registro, sesión persistente) | ⏳ Pendiente |
| 2 | Servicio de TMDB, pantallas Buscar y Detalle | ✅ |
| 3 | Mi lista y Editar mi entrada (interfaz y reglas) | ✅ En memoria |
| 3 | Firestore, caché en AsyncStorage y modo sin conexión | ⏳ Pendiente |
| 3 | Reglas de seguridad (`firestore.rules`) | ⏳ Pendiente |

## Requisitos

- Node.js 20 o superior
- App **Expo Go** en el teléfono (o un emulador Android / simulador iOS)
- Una cuenta de TMDB con acceso a la API (uso no comercial)

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

Para probar el token fuera de la app:

```bash
curl -H "Authorization: Bearer $EXPO_PUBLIC_TMDB_TOKEN" \
  "https://api.themoviedb.org/3/search/multi?query=matrix&language=es-ES"
```

> **Seguridad de la clave:** todo valor `EXPO_PUBLIC_` queda incluido en el paquete de la app y
> alguien podría extraerlo. Para este proyecto no comercial el riesgo se acepta: el token solo
> permite leer el catálogo público de TMDB y el archivo `.env` no se sube al repositorio
> (está en `.gitignore`). La solución de fondo sería un proxy en un servidor propio que guarde
> el token.

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
| Autenticación / BD / caché | Firebase Auth, Firestore, AsyncStorage | *(Paso 3 y 4)* |

```
App.tsx                     Proveedores y navegación raíz
src/
├── components/             Componentes reutilizables (Poster, Boton, Chip, Estrellas, TmdbLogo…)
├── config/env.ts           Lectura de variables de entorno
├── context/                CarteleraContext: lista personal y acciones
├── hooks/                  usePeticion<T>, useBusqueda, useDebounce
├── navigation/             RootNavigator (pila) y TabsNavigator (pestañas)
├── screens/                Una pantalla por archivo
├── services/
│   ├── http.ts             fetch genérico con tiempo máximo, cancelación y errores en español
│   └── tmdbService.ts      buscar, obtenerDetalle, construirUrlImagen
├── theme/tema.ts           Colores, espacios y alto mínimo tocable (44 px)
├── types/                  Tipos de dominio, de la API de TMDB, de navegación y EstadoPeticion<T>
└── utils/                  Funciones puras (formato, itemId, regla de calificación, assertNever)
```

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
