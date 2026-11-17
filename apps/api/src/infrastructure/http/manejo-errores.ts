import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import {
  ErrorDominio,
  type CodigoError,
  type DetalleError,
} from '../../domain/errors/errores-dominio.js';

export interface CuerpoError {
  error: string;
  detalles?: DetalleError[];
}

const ESTADO_POR_CODIGO: Record<CodigoError, number> = {
  VALIDACION: 400,
  NO_AUTENTICADO: 401,
  PROHIBIDO: 403,
  NO_ENCONTRADO: 404,
  CONFLICTO: 409,
};

function esErrorHttpCliente(error: unknown): error is { statusCode: number; message: string } {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof error.statusCode === 'number' &&
    error.statusCode >= 400 &&
    error.statusCode < 500
  );
}

function detallesDeZod(error: ZodError): DetalleError[] {
  return error.issues.map((issue) => ({
    campo: issue.path.length > 0 ? issue.path.join('.') : '(cuerpo)',
    mensaje: issue.message,
  }));
}

export function registrarManejoErrores(app: FastifyInstance): void {
  app.setNotFoundHandler((_request, reply) => {
    const cuerpo: CuerpoError = { error: 'Recurso no encontrado' };
    return reply.status(404).send(cuerpo);
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      const cuerpo: CuerpoError = { error: 'Datos inválidos', detalles: detallesDeZod(error) };
      return reply.status(400).send(cuerpo);
    }

    if (error instanceof ErrorDominio) {
      const cuerpo: CuerpoError =
        error.detalles.length > 0
          ? { error: error.message, detalles: error.detalles }
          : { error: error.message };
      return reply.status(ESTADO_POR_CODIGO[error.codigo]).send(cuerpo);
    }

    if (esErrorHttpCliente(error)) {
      const cuerpo: CuerpoError = { error: error.message };
      return reply.status(error.statusCode).send(cuerpo);
    }

    request.log.error({ err: error }, 'Error no controlado');
    const cuerpo: CuerpoError = { error: 'Error interno del servidor' };
    return reply.status(500).send(cuerpo);
  });
}
