# Uso de IA · Entregable 3, Mi año en cine

**Herramienta:** Claude Code (Claude Opus 5.5) en VS Code, con el harness de este repositorio
(AGENTS.md, CLAUDE.md, la skill `/commit`, el hook de Prettier y los sensores de Vitest).
**Forma de trabajo:** cada paso partió de un documento (enunciado, auditoría, PRD, spec o
DESIGN.md). El agente propuso y escribió; yo revisé cada cambio antes del commit y tomé las
decisiones: los RF base, la paleta, el orden del Hito 3 y los puntos abiertos.

La bitácora del Proyecto 3 sigue en `docs/BITACORA_IA.md`.

## Cinco momentos clave

### 1. Los RF del Proyecto 3 mal numerados

- **Qué pedí:** la auditoría inicial contra SPEC.md y los RF1 a RF10 del Proyecto 3.
- **Qué hizo el agente:** como ninguno de los dos estaba en el repositorio, le pedí que escribiera
  los RF en un PRD. Los reconstruyó a partir del README y de los comentarios `RFx` del código.
  Acertó RF1, RF4, RF6 y RF8 (los que citaba el código), pero inventó el orden del resto: puso la
  privacidad como RF9 y Acerca de como RF10.
- **Qué se corrigió:** le adjunté el enunciado y la rúbrica del Entregable 2. El agente rehízo el
  PRD con los RF oficiales (RF9 = Acerca de, RF10 = TypeScript y capas) y pasó las reglas de
  Firestore a SEG1 a SEG3. La auditoría se escribió sobre esa versión.
- **Qué parte del harness lo habría evitado:** la regla de AGENTS.md "si la spec no cubre un caso,
  se anota y se pregunta; no se inventa la regla", y tener el enunciado del proyecto anterior en
  `docs/` desde el principio.

### 2. El sensor de colores habría bloqueado el dominio

- **Qué pedí:** seguir el orden del enunciado en el Hito 3: spec, tests, dominio, datos y tokens.
- **Qué hizo el agente:** antes de escribir código notó un conflicto. El test de colores fijos
  (Hito 2) seguía en rojo por el logo de TMDB y solo pasaría con los tokens del paso 15, pero el
  paso 13 exige `npm test` en verde. Me preguntó en lugar de saltarse el sensor.
- **Qué se corrigió:** decidí adelantar los tokens. Quedó escrito en la spec 01 §3, y el commit
  `feat: tokens…` va antes que `test: dominio… (en rojo)`.
- **Qué parte del harness lo habría evitado (o lo detectó):** la regla "ningún sensor se
  desactiva" y la obligación de pasar `npm test` antes de cada commit de código, que hicieron
  visible el conflicto.

### 3. Las horas y el error de coma flotante

- **Qué pedí:** los tests de D7 (horas con un decimal) antes de implementar.
- **Qué hizo el agente:** al escribir el backlog vio que "un decimal" no decía cómo redondear
  (PA-4) y que `2247 / 60 * 10` da `374,4999…` en JavaScript, así que `Math.round` redondearía
  hacia abajo.
- **Qué se corrigió:** se aceptó el redondeo al décimo más cercano. La spec fija la fórmula
  `Math.round(min / 6) / 10`, y el test incluye 2245 → 37,4 y 2247 → 37,5, que falla con la fórmula
  ingenua.
- **Qué parte del harness lo habría evitado:** los tests primero (`test:` en rojo antes de `feat:`),
  con casos límite derivados de cada decisión.

### 4. Prettier y los finales de línea de Windows

- **Qué pedí:** comprobar que el sensor de RF6 de verdad detecta un error, rompiendo la regla a
  propósito.
- **Qué hizo el agente:** rompió `normalizarCambios`, vio fallar el test y lo restauró con
  `git checkout`. Más tarde, `prettier --check` marcó ese archivo: git lo había dejado con CRLF por
  `core.autocrlf`, aunque no tenía ningún cambio.
- **Qué se corrigió:** `endOfLine: "auto"` en `.prettierrc`, en su propio commit `chore:`, para que
  en un clon nuevo en Windows el chequeo de formato no dé falsos positivos.
- **Qué parte del harness lo habría evitado (o lo detectó):** el hook de Prettier y `format:check`
  lo detectaron. La configuración inicial de Prettier debió contemplar Windows desde el principio.

### 5. Las pruebas de las reglas en el Rules Playground

- **Qué pedí:** cómo probar en la consola las reglas nuevas (CA-A.1.10 a CA-A.1.12).
- **Qué hizo el agente:** primero indicó simular un *create* con los 13 campos. El simulador no
  permite pegar JSON ni generar `serverTimestamp`, así que era muy lento, y mis primeras capturas
  fallaban por otra causa: puse `UID_A` literal en la ruta y usé el tipo *get*.
- **Qué se corrigió:** el agente leyó cada captura, señaló por qué se denegaba (en `esDueno` o en
  `hasAll`, no en `duracionMin`) y cambió el método: un *update* sobre una obra real, que el
  simulador mezcla con el documento existente, con solo `duracionMin: -5`. La evidencia válida
  quedó denegada en `camposNuevosValidos`, después de pasar todo `esItemValido`.
- **Qué parte del harness lo habría evitado:** que la spec (§7) dijera desde el inicio cómo se
  prueba cada regla y qué línea debe fallar, igual que la tabla criterio → verificación.

## Qué hice yo

- Las decisiones del cliente (D1 a D13) no se tocaron. Revisé y acepté las propuestas de los
  puntos abiertos PA-1 a PA-9, que siguen pendientes de confirmar con el docente.
- Elegí la personalidad y la emoción del brief, aprobé la paleta del brand board y el orden de
  la pantalla.
- Publiqué las reglas y tomé las capturas de la consola.
- Hice la verificación en el teléfono (`docs/VERIFICACION.md`).
