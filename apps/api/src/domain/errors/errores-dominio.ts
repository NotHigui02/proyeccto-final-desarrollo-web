export type CodigoError =
  'VALIDACION' | 'NO_AUTENTICADO' | 'PROHIBIDO' | 'NO_ENCONTRADO' | 'CONFLICTO';

export interface DetalleError {
  campo: string;
  mensaje: string;
}

export class ErrorDominio extends Error {
  constructor(
    readonly codigo: CodigoError,
    mensaje: string,
    readonly detalles: DetalleError[] = [],
  ) {
    super(mensaje);
    this.name = new.target.name;
  }
}

export class ErrorValidacion extends ErrorDominio {
  constructor(mensaje: string, detalles: DetalleError[] = []) {
    super('VALIDACION', mensaje, detalles);
  }
}

export class ErrorNoAutenticado extends ErrorDominio {
  constructor(mensaje = 'Se requiere iniciar sesión') {
    super('NO_AUTENTICADO', mensaje);
  }
}

export class ErrorProhibido extends ErrorDominio {
  constructor(mensaje = 'No tiene permiso para esta acción') {
    super('PROHIBIDO', mensaje);
  }
}

export class ErrorNoEncontrado extends ErrorDominio {
  constructor(mensaje = 'Recurso no encontrado') {
    super('NO_ENCONTRADO', mensaje);
  }
}

export class ErrorConflicto extends ErrorDominio {
  constructor(mensaje: string) {
    super('CONFLICTO', mensaje);
  }
}
