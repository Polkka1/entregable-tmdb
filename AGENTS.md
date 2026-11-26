# Mi Cartelera Personal

## Qué es la app

App móvil para buscar películas y series en TMDB y llevar una lista personal y privada. Cada obra
tiene un estado (*Por ver*, *Viendo* o *Vista*), una calificación de 1 a 5 (solo si está vista) y
un comentario. La lista se guarda en Firestore, con una copia en AsyncStorage para verla sin
conexión.

La épica en curso es *Mi año en cine*: una pestaña con el resumen de lo que el usuario vio en un
año. Los requisitos están en `docs/prd/PRD.md` y el estado del código en `docs/AUDITORIA.md`.

## Stack

- Expo SDK 58, React Native y TypeScript estricto. Se prueba en Expo Go.
- React Navigation (pila nativa y pestañas inferiores). **No se usa Expo Router.**
- Firebase JS SDK: Auth y Firestore. TMDB API v3.
- Context API para el estado global y AsyncStorage para la copia local.
- Vitest para los tests y Prettier para el formato.

## Capas y carpetas

```
App.tsx                 Proveedores y navegación raíz
src/
  screens/              Una pantalla por archivo. Solo interfaz: leen el contexto y llaman a hooks o servicios
  components/           Componentes reutilizables
  navigation/           RootNavigator (pila, Login condicional) y TabsNavigator (pestañas)
  context/              SesionContext (usuario) y CarteleraContext (lista y acciones)
  hooks/                usePeticion<T>, useBusqueda, useDebounce
  services/             Único lugar que habla con Firebase, TMDB y AsyncStorage
  dominio/              Funciones puras de reglas de negocio y sus tests (*.test.ts)
  tema/                 Tokens de diseño: colores, espacios, radios y tamaños. Única fuente de verdad
  types/                Tipos del dominio, de TMDB, de navegación y EstadoPeticion<T>
  utils/                Funciones puras de apoyo (formato, itemId, errores)
  config/env.ts         Lectura de las variables EXPO_PUBLIC_*
firestore.rules         Reglas de seguridad (copia de las publicadas)
DESIGN.md               Sistema de diseño: principios, tokens, componentes, pantallas y voz
docs/
  prd/                  PRD: RF1 a RF10 y reglas de negocio D1 a D13
  backlog/              Épica, historias, criterios DADO/CUANDO/ENTONCES y tickets
  specs/                Specs técnicas, una por cambio
  diseno/               BRIEF.md y brand-board.html
  AUDITORIA.md          Auditoría inicial y final
  VERIFICACION.md       Verificación humana en el teléfono
  IA.md                 Momentos clave del uso de IA
```

Datos: `usuarios/{uid}/mi_lista/{itemId}`, con `itemId = tipo_tmdbId` (por ejemplo `movie_550`).

## Comandos

```bash
npm test                    # Vitest (todos los *.test.ts de src/)
npx tsc --noEmit            # tipos
npx expo lint               # ESLint
npx expo start              # servidor de desarrollo (Expo Go)
npx expo install <paquete>  # SIEMPRE en lugar de npm install: elige la versión compatible con el SDK
npx expo-doctor             # diagnóstico de dependencias y configuración
```

Antes de dar una tarea por terminada y antes de cada commit de código: `npm test` y
`npx tsc --noEmit` deben pasar, y `npx expo lint` no debe dar errores.

## Reglas

**Secretos**
- Nunca leer, mostrar ni modificar `.env`. La configuración de Firebase y el token de TMDB no se
  escriben en el código ni en el chat; solo se leen desde `config/env.ts`.
- Mantener `.env.example` al día, sin valores reales.

**Capas y tipos**
- Las pantallas y los componentes no importan `firebase/*` ni llaman a `fetch`: usan `src/services/`
  a través del contexto o de hooks.
- `src/dominio/` no importa `react-native`, `firebase` ni servicios, y no lee la fecha del sistema
  (`new Date()` sin argumentos o `Date.now()`). El año actual o la hora se reciben como parámetro.
- Sin `any`. Si es inevitable, se justifica con un comentario en la misma línea.
- Cada petición expone carga, error y éxito con `EstadoPeticion<T>` (`src/types/peticion.ts`).
- Los `switch` sobre uniones usan `assertNever`; los mapas por estado o tipo usan `Record<...>`.

**Interfaz**
- **Antes de crear o modificar cualquier archivo de `src/screens/`, `src/components/`,
  `src/navigation/` o `src/tema/`, lee `DESIGN.md` y usa sus tokens y componentes.** Si algo no
  está en DESIGN.md, no lo inventes: usa lo más cercano y avisa. El agente no modifica DESIGN.md
  por su cuenta; solo propone cambios.
- Colores, espacios, radios y tamaños salen de `src/tema/`. Ningún archivo fuera de `src/tema/`
  escribe un color hexadecimal.
- Todo elemento tocable mide al menos 44 px (`ALTURA_TOCABLE_MIN`).
- Las acciones destructivas piden confirmación.
- Mantener visible la atribución de TMDB, menos prominente que la marca de la app.
- Identificadores, comentarios y textos de la interfaz en español.

**Proceso (spec-driven)**
- Ningún código sin un documento detrás: PRD → backlog → spec en `docs/specs/` → tests → código.
  Si la spec no cubre un caso, se anota como punto abierto en el PRD y se pregunta; no se inventa
  la regla.
- En el historial, el commit `docs:` de cada cambio va antes que el de código, y en `src/dominio/`
  el commit `test:` (tests en rojo) va antes que el `feat:`.
- Ningún sensor se desactiva: no se borra, se salta (`.skip`, `.only`) ni se debilita un test
  para que pase.
- Dependencias nuevas solo si la spec las justifica, con `npx expo install` y compatibles con
  Expo Go. No se usan librerías de gráficas: las barras se construyen con `View`.
- Las reglas de negocio no viven en las pantallas: se calculan en `src/dominio/` y se prueban con
  Vitest.

## Commits

Se hacen con la skill del proyecto `/commit-es` (`.claude/skills/commit-es/SKILL.md`), que aplica
esta convención. Van en español, con prefijo y en minúsculas después de él:

| Prefijo | Uso |
|---|---|
| `docs:` | PRD, backlog, specs, diseño, auditoría, README, AGENTS.md |
| `test:` | Tests nuevos o modificados |
| `feat:` | Funcionalidad nueva |
| `fix:` | Corrección de un error |
| `chore:` | Herramientas, dependencias, configuración, cambios de rutas o de formato |

Cada commit agrupa un solo cambio lógico. Nunca se incluye `.env`, y no se hace `push` si no se
pide.

## Expo

- La versión del SDK es la de `expo` en `package.json` (58). Antes de usar una API de Expo o de
  React Native, consulta `https://docs.expo.dev/versions/v58.0.0/` o
  `https://docs.expo.dev/llms.txt`; no confíes en lo que recuerdas de otras versiones.
- `ios/` y `android/` se generan (Continuous Native Generation): no se crean ni se editan a mano.
  La configuración nativa va en `app.json` y en los config plugins.
- Expo Go solo trae sus módulos nativos: no agregues librerías con código nativo propio.
