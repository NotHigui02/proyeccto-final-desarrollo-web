// Política de seguridad de la IA del proyecto. Funciones puras: las usan los hooks y las pruebas de ia/pruebas.
import { realpathSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const RUTAS_SENSIBLES = [
  /(^|\/)\.env(\.(?!example$)[^/]+)?$/i,
  /(^|\/)\.envrc$/i,
  /\.(pem|key|p12|pfx|jks|keystore)$/i,
  /(^|\/)id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$/i,
  /(service[-_]?account|firebase-adminsdk|credentials?)[^/]*\.json$/i,
  /(^|\/)\.(ssh|aws|gnupg|azure|kube)(\/|$)/i,
  /(^|\/)\.config\/(gcloud|firebase|configstore)(\/|$)/i,
  /(^|\/)\.(npmrc|netrc|git-credentials)$/i,
  /(^|\/)\.vercel(\/|$)/i,
];

const TEXTO_SENSIBLE =
  /(^|[^\w.-])\.env(?!\.example\b)(?![\w-])|\.envrc\b|\.(pem|key|p12|pfx|jks)\b|\bid_(rsa|dsa|ecdsa|ed25519)\b|service[-_]?account|firebase-adminsdk|(^|[^\w])\.(ssh|aws|gnupg|npmrc|netrc|git-credentials)\b/i;

const RUTAS_SISTEMA_PERMITIDAS = [
  /^\/dev\/(null|stdout|stderr|stdin)$/,
  /^\/(usr\/)?(local\/)?s?bin\//,
  /^\/opt\/homebrew\/bin\//,
];

const COMANDOS_DENEGADOS = [
  [/^sudo\b/, 'requiere privilegios de administrador'],
  [
    /^(printenv|env|set|export\s+-p)$/,
    'imprime variables de entorno, que pueden contener secretos',
  ],
  [/^printenv\b/, 'imprime variables de entorno, que pueden contener secretos'],
];

const COMANDOS_CON_PERMISO = [
  [/^git\s+push\b/, 'publica cambios en el repositorio remoto'],
  [
    /^git\s+(reset\s+--hard|clean\s+-\w*f|branch\s+-D|rebase|filter-branch)\b/,
    'reescribe o borra historial',
  ],
  [/^rm\s+(-\w*r|--recursive)/, 'borra directorios de forma recursiva'],
  [
    /^(npm|pnpm|yarn|bun)\s+(i|install|add|ci|uninstall|remove|rm|update|up|publish|exec|dlx)\b/,
    'modifica dependencias o publica paquetes',
  ],
  [/^(npx|pnpx|bunx)\b/, 'descarga y ejecuta paquetes'],
  [
    /^(curl|wget|ssh|scp|sftp|rsync|ftp|nc|ncat|telnet)\b/,
    'hace conexiones de red fuera de la máquina',
  ],
  [/^(vercel|firebase|gcloud|gh|az|aws|docker|kubectl)\b/, 'actúa sobre servicios externos'],
];

function normalizar(ruta) {
  return String(ruta).replaceAll('\\', '/');
}

function expandirHome(ruta) {
  return ruta.replace(/^(~|\$HOME|\$\{HOME\})(?=\/|$)/, os.homedir());
}

function rutaReal(ruta) {
  const resto = [];
  let actual = path.resolve(ruta);
  for (;;) {
    try {
      return path.join(realpathSync(actual), ...resto);
    } catch {
      const padre = path.dirname(actual);
      if (padre === actual) return path.resolve(ruta);
      resto.unshift(path.basename(actual));
      actual = padre;
    }
  }
}

export function esRutaSensible(ruta) {
  const normalizada = normalizar(ruta);
  return RUTAS_SENSIBLES.some((patron) => patron.test(normalizada));
}

export function mencionaSecretos(texto) {
  return TEXTO_SENSIBLE.test(normalizar(texto));
}

export function estaDentroDelProyecto(ruta, raiz, base = raiz) {
  const absoluta = rutaReal(path.resolve(base, expandirHome(normalizar(ruta))));
  const relativa = path.relative(rutaReal(raiz), absoluta);
  return (
    relativa === '' ||
    (relativa !== '..' && !relativa.startsWith(`..${path.sep}`) && !path.isAbsolute(relativa))
  );
}

/** @returns {{ permiso: 'allow' | 'deny', motivo?: string }} */
export function evaluarRuta(ruta, raiz, base = raiz) {
  if (typeof ruta !== 'string' || ruta.trim() === '') return { permiso: 'allow' };
  const absoluta = path.resolve(base, expandirHome(normalizar(ruta)));
  if (esRutaSensible(ruta) || esRutaSensible(rutaReal(absoluta))) {
    return { permiso: 'deny', motivo: `"${ruta}" es un archivo de secretos o credenciales` };
  }
  if (!estaDentroDelProyecto(ruta, raiz, base)) {
    return { permiso: 'deny', motivo: `"${ruta}" está fuera de la carpeta del proyecto` };
  }
  return { permiso: 'allow' };
}

/** Patrones de búsqueda (glob o regex de Grep) que apuntan a archivos de secretos. */
export function evaluarPatron(patron) {
  if (typeof patron !== 'string' || patron === '') return { permiso: 'allow' };
  if (mencionaSecretos(patron) || esRutaSensible(patron.replace(/[*?[\]{}]/g, ''))) {
    return { permiso: 'deny', motivo: `el patrón "${patron}" apunta a archivos de secretos` };
  }
  return { permiso: 'allow' };
}

function segmentos(comando) {
  return comando
    .split(/&&|\|\||[;|&\n]/)
    .map((s) => s.trim().replace(/^[({]\s*/, ''))
    .map((s) => s.replace(/^(\w+=\S*\s+)+/, ''))
    .filter(Boolean);
}

function candidatosARuta(comando) {
  return comando
    .split(/[\s;|&()<>]+/)
    .map((t) => t.replace(/^['"]|['"]$/g, ''))
    .map((t) => (t.startsWith('-') && t.includes('=') ? t.slice(t.indexOf('=') + 1) : t))
    .filter((t) => t !== '' && !t.includes('://'))
    .filter((t) => /^(\/|~|\$HOME|\$\{HOME\})/.test(t) || /(^|\/)\.\.(\/|$)/.test(t));
}

/** @returns {{ permiso: 'allow' | 'deny' | 'ask', motivo?: string }} */
export function evaluarComando(comando, raiz, cwd = raiz) {
  if (typeof comando !== 'string' || comando.trim() === '') return { permiso: 'allow' };

  if (!estaDentroDelProyecto(cwd, raiz)) {
    return { permiso: 'deny', motivo: 'el directorio de trabajo está fuera del proyecto' };
  }
  if (mencionaSecretos(comando)) {
    return { permiso: 'deny', motivo: 'el comando menciona archivos de secretos o credenciales' };
  }

  for (const segmento of segmentos(comando)) {
    for (const [patron, motivo] of COMANDOS_DENEGADOS) {
      if (patron.test(segmento)) return { permiso: 'deny', motivo: `"${segmento}" ${motivo}` };
    }
  }

  for (const candidato of candidatosARuta(comando)) {
    if (RUTAS_SISTEMA_PERMITIDAS.some((p) => p.test(candidato))) continue;
    if (!estaDentroDelProyecto(candidato, raiz, cwd)) {
      return { permiso: 'deny', motivo: `"${candidato}" está fuera de la carpeta del proyecto` };
    }
  }

  for (const segmento of segmentos(comando)) {
    for (const [patron, motivo] of COMANDOS_CON_PERMISO) {
      if (patron.test(segmento)) return { permiso: 'ask', motivo: `"${segmento}" ${motivo}` };
    }
  }

  return { permiso: 'allow' };
}

export function raizDelProyecto(entrada) {
  const raiz = entrada?.workspace_roots?.[0] ?? process.env.CURSOR_PROJECT_DIR ?? process.cwd();
  return path.resolve(raiz);
}

export async function leerEntrada() {
  let texto = '';
  for await (const trozo of process.stdin) texto += trozo;
  return texto.trim() === '' ? {} : JSON.parse(texto);
}

export function responder(objeto) {
  process.stdout.write(`${JSON.stringify(objeto)}\n`);
}
