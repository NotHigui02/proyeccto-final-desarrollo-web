#!/usr/bin/env node
// Hook beforeShellExecution: niega secretos y rutas externas; pide permiso para efectos fuera de la máquina.
import { evaluarComando, leerEntrada, raizDelProyecto, responder } from './politica.mjs';

try {
  const entrada = await leerEntrada();
  const raiz = raizDelProyecto(entrada);
  const decision = evaluarComando(entrada.command, raiz, entrada.cwd || raiz);

  if (decision.permiso === 'allow') {
    responder({ permission: 'allow' });
  } else {
    responder({
      permission: decision.permiso,
      user_message:
        decision.permiso === 'ask'
          ? `La IA quiere ejecutar un comando que ${decision.motivo.replace(/^"[^"]*"\s*/, '')}. ¿Lo permites?`
          : `Bloqueado por la política de IA del proyecto: ${decision.motivo}.`,
      agent_message: `Política del proyecto: ${decision.motivo}.`,
    });
  }
} catch (error) {
  responder({
    permission: 'deny',
    user_message: `El hook de seguridad falló y bloqueó el comando por precaución: ${String(error)}`,
  });
}
