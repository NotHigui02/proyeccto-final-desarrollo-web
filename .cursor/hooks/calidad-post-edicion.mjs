#!/usr/bin/env node
// Hook postToolUse: formatea y revisa con ESLint cada archivo que edita la IA y le devuelve los errores.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  esRutaSensible,
  estaDentroDelProyecto,
  leerEntrada,
  raizDelProyecto,
  responder,
} from './politica.mjs';

const HERRAMIENTAS_DE_EDICION = /^(Write|StrReplace|Edit|MultiEdit|EditNotebook)$/;
const FORMATEABLES = /\.(ts|tsx|js|mjs|cjs|json|css|md|html|ya?ml)$/;
const LINTEABLES = /\.(ts|tsx|js|mjs|cjs)$/;

try {
  const entrada = await leerEntrada();
  const raiz = raizDelProyecto(entrada);
  const archivo = entrada.tool_input?.path ?? entrada.tool_input?.file_path;
  const binario = (nombre) => path.join(raiz, 'node_modules', '.bin', nombre);

  const aplica =
    HERRAMIENTAS_DE_EDICION.test(entrada.tool_name ?? '') &&
    typeof archivo === 'string' &&
    FORMATEABLES.test(archivo) &&
    !esRutaSensible(archivo) &&
    estaDentroDelProyecto(archivo, raiz) &&
    existsSync(binario('prettier'));

  if (!aplica) {
    responder({});
  } else {
    const opciones = { cwd: raiz, encoding: 'utf8', timeout: 45_000 };
    spawnSync(binario('prettier'), ['--write', '--ignore-unknown', archivo], opciones);

    const lint = LINTEABLES.test(archivo)
      ? spawnSync(binario('eslint'), ['--fix', '--max-warnings', '0', archivo], opciones)
      : { status: 0 };

    if (lint.status === 0) {
      responder({});
    } else {
      const salida = `${lint.stdout ?? ''}${lint.stderr ?? ''}`.slice(0, 4000);
      responder({
        additional_context: `ESLint encontró problemas en ${path.relative(raiz, path.resolve(raiz, archivo))} que debes corregir antes de continuar:\n${salida}`,
      });
    }
  }
} catch {
  responder({});
}
