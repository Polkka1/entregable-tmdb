---
name: commit-es
description: Commits de Mi Cartelera Personal en español con prefijo (docs:, feat:, fix:, test:, chore:), siguiendo el orden spec-driven del proyecto. Úsala cuando el usuario pida /commit-es, "haz el commit" o "commitea esto" en este repositorio.
argument-hint: '[--push]'
allowed-tools: Bash(git:*) Bash(npm test) Bash(npx tsc --noEmit) Bash(npx expo lint) Read Write
---

# /commit-es · Commits de Mi Cartelera Personal

Crea commits que respetan la convención de `AGENTS.md`. Un commit agrupa un solo cambio lógico, y
el historial debe mostrar que la documentación va antes que el código.

## 1. Revisar qué cambió

1. Ejecuta `git status --short` y `git diff --stat`. Si hay archivos ya preparados (*staged*),
   revisa también `git diff --cached`.
2. **Nunca** agregues `.env`, `.env.*` (salvo `.env.example`), credenciales ni archivos de
   `node_modules/`, `.expo/`, `ios/` o `android/`. Si aparecen, detente y avisa.
3. Si hay cambios que no son del mismo tema (por ejemplo, una spec y el código que la implementa),
   son **commits distintos**. Propón la división antes de seguir.
4. Si el usuario tiene a medio llenar un archivo como `docs/VERIFICACION.md`, no lo incluyas sin
   preguntar.

## 2. Elegir el prefijo

| Prefijo | Uso |
|---|---|
| `docs:` | PRD, backlog, specs, diseño, auditoría, verificación, README, AGENTS.md, DESIGN.md, capturas |
| `test:` | Tests nuevos o modificados, incluidos los que se commitean en rojo antes de implementar |
| `feat:` | Funcionalidad nueva (dominio, servicios, componentes, pantallas, reglas, tokens) |
| `fix:` | Corrección de un error encontrado en una verificación o una auditoría |
| `chore:` | Herramientas, dependencias, configuración, scripts, cambios de rutas o de formato |

**Orden spec-driven.** Antes de commitear código, comprueba con `git log --oneline` que exista
el commit `docs:` que lo respalda. En `src/dominio/`, el commit `test:` (en rojo) va antes que el
`feat:`. Si falta el documento, detente y propón escribirlo primero.

## 3. Verificar los sensores (solo en commits de código)

Para `feat:`, `fix:` y `chore:` que toquen `src/`:

```bash
npm test
npx tsc --noEmit
npx expo lint
```

Los tres deben pasar. La única excepción es un `test:` en rojo a propósito: `tsc` y `lint` deben
pasar igual, y el mensaje dice cuántos tests quedan en rojo y por qué. Nunca uses `--no-verify` ni
desactives un test (`.skip`, `.only`) para poder commitear.

## 4. Escribir el mensaje

- **Asunto:** `prefijo: descripción`, en español, en minúsculas después del prefijo, sin punto
  final, con 72 caracteres como máximo. Describe el cambio, no el archivo: `feat: dominio del
  resumen anual de Mi año en cine`.
- **Cuerpo**, separado por una línea en blanco: el **porqué**, citando el paso, el ticket
  (T-A0x), las decisiones (D1 a D13, PA-x), los criterios (CA-A.x.y) o los hallazgos (A-xx, F-xx)
  que lo motivan, y cómo se verificó (por ejemplo, "npm test 101/101, tsc y lint sin errores").
- Escribe el mensaje en un archivo temporal y haz el commit con `git commit -F <archivo>`, no con
  `-m` y un heredoc.

## 5. Hacer el commit

1. Prepara solo los archivos del cambio, nombrándolos: `git add -- <ruta> <ruta>`.
2. Ejecuta `git commit -F <archivo>` y revisa el código de salida.
3. Confirma el resultado con `git log --oneline -1` y `git status --short`.
4. Haz `git push` **solo** si el usuario lo pidió (`--push` o en el mensaje).
