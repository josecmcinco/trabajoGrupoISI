import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../models/siger.models';

export function extractErrorMessage(err: unknown, fallback = 'Ha ocurrido un error inesperado'): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as ApiErrorResponse | string | null;
    if (body && typeof body === 'object') {
      if (body.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
        return Object.values(body.fieldErrors).join(' | ');
      }
      if (body.message) {
        return body.message;
      }
    }
    if (typeof body === 'string' && body.trim().length > 0) {
      return body;
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor backend (http://localhost:8080)';
    }
  }
  return fallback;
}
