import { existsSync } from 'node:fs';
import { construirApp } from './app.js';
import { crearDependencias } from './container.js';
import { cargarEntorno } from './infrastructure/config/entorno.js';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const entorno = cargarEntorno(process.env);
const app = construirApp(entorno, crearDependencias(entorno));

try {
  await app.listen({ host: entorno.HOST, port: entorno.PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
