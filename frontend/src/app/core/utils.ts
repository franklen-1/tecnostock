import { HttpErrorResponse } from '@angular/common/http';

/** Obtiene un mensaje legible del error que devolvió la API. */
export function mensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    const detalle = error.error?.detail;
    if (typeof detalle === 'string') return detalle;                       // errores de negocio (AppError)
    if (Array.isArray(detalle)) return 'Hay datos inválidos en el formulario.'; // errores 422 de Pydantic
  }
  return 'Ocurrió un error inesperado.';
}

/** Fecha y hora actual en formato que entiende <input type="datetime-local">. */
export function ahoraLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
