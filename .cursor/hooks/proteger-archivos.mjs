#!/usr/bin/env node
// Hook beforeReadFile y preToolUse: bloquea secretos, rutas fuera del proyecto y comandos peligrosos.
import {
  evaluarComando,
  evaluarPatron,
  evaluarRuta,
  leerEntrada,
  raizDelProyecto,
  responder,
} from './politica.mjs';

const CLAVES_DE_RUTA = [
  'path',
  'file_path',
  'target_directory',
  'target_notebook',
  'working_directory',
];
const CLAVES_DE_PATRON = ['glob_pattern', 'glob'];

function decidir(entrada) {
  const raiz = raizDelProyecto(entrada);

  if (typeof entrada.file_path === 'string') {
    return evaluarRuta(entrada.file_path, raiz);
  }

  const parametros = entrada.tool_input ?? {};
  for (const clave of CLAVES_DE_RUTA) {
    const decision = evaluarRuta(parametros[clave], raiz);
    if (decision.permiso !== 'allow') return decision;
  }
  for (const clave of CLAVES_DE_PATRON) {
    const decision = evaluarPatron(parametros[clave]);
    if (decision.permiso !== 'allow') return decision;
  }
  if (typeof parametros.command === 'string') {
    return evaluarComando(parametros.command, raiz, parametros.working_directory ?? raiz);
  }
  return { permiso: 'allow' };
}

try {
  const decision = decidir(await leerEntrada());
  if (decision.permiso === 'allow') {
    responder({ permission: 'allow' });
  } else {
    responder({
      permission: decision.permiso,
      user_message: `Bloqueado por la política de IA del proyecto: ${decision.motivo}.`,
      agent_message: `Política del proyecto: ${decision.motivo}. No intentes evadir esta restricción; pide ayuda al usuario.`,
    });
  }
} catch (error) {
  responder({
    permission: 'deny',
    user_message: `El hook de seguridad falló y bloqueó la acción por precaución: ${String(error)}`,
  });
}
