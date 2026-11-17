let appListo;

async function obtenerApp() {
  if (appListo) return appListo;
  const { construirApp } = await import('../apps/api/dist/app.js');
  const { crearDependencias } = await import('../apps/api/dist/container.js');
  const { cargarEntorno } = await import('../apps/api/dist/infrastructure/config/entorno.js');
  const entorno = cargarEntorno(process.env);
  const app = construirApp(entorno, crearDependencias(entorno));
  await app.ready();
  appListo = app;
  return app;
}

/** Punto de entrada serverless de Vercel: reenvía la petición a Fastify. */
export default async function handler(request, response) {
  const app = await obtenerApp();
  app.server.emit('request', request, response);
}
