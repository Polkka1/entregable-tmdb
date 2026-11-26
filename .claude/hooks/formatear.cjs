// Hook PostToolUse (Edit|Write): formatea con Prettier el archivo que el agente acaba de editar.
// Usa el Prettier y la configuración del proyecto (.prettierrc, .prettierignore).
// Nunca hace fallar al agente: si algo sale mal, el archivo queda como estaba.

const fs = require('fs');
const path = require('path');

const EXTENSIONES = new Set(['.ts', '.tsx', '.js', '.cjs', '.mjs', '.json']);
const RAIZ_PROYECTO = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');

async function leerEntrada() {
  let texto = '';
  process.stdin.setEncoding('utf8');
  for await (const fragmento of process.stdin) {
    texto += fragmento;
  }
  return texto;
}

async function main() {
  const entrada = JSON.parse(await leerEntrada());
  const archivo = entrada.tool_input && entrada.tool_input.file_path;
  if (!archivo || !EXTENSIONES.has(path.extname(archivo).toLowerCase())) return;
  if (!fs.existsSync(archivo)) return;

  const prettier = require(require.resolve('prettier', { paths: [RAIZ_PROYECTO] }));

  const info = await prettier.getFileInfo(archivo, {
    ignorePath: path.join(RAIZ_PROYECTO, '.prettierignore'),
  });
  if (info.ignored) return;

  const original = fs.readFileSync(archivo, 'utf8');
  const configuracion = await prettier.resolveConfig(archivo);
  const formateado = await prettier.format(original, { ...configuracion, filepath: archivo });

  if (formateado !== original) {
    fs.writeFileSync(archivo, formateado);
  }
}

main()
  .catch(() => {})
  .finally(() => {
    process.exitCode = 0;
  });
