import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry, switchMap, catchError } from 'rxjs/operators';

export interface ErrorMessage {
  type: 'connection' | 'validation' | 'server' | 'unknown';
  title: string;
  message: string;
  actions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiErrorHandlerService {

  constructor() { }

  /**
   * Maneja errores de conexión con reintentos automáticos
   */
  handleConnectionError(error: HttpErrorResponse, maxRetries: number = 3): Observable<never> {
    if (this.isConnectionError(error)) {
      return this.retryWithBackoff(maxRetries);
    }
    return throwError(() => error);
  }

  /**
   * Implementa reintentos con backoff exponencial
   */
  private retryWithBackoff(maxRetries: number): Observable<never> {
    return throwError(() => new Error('Retry needed')).pipe(
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          console.log(`🔄 Reintento ${retryCount} de ${maxRetries}`);
          return timer(retryCount * 1000); // Backoff exponencial: 1s, 2s, 3s
        }
      })
    );
  }

  /**
   * Determina si un error es de conexión
   */
  private isConnectionError(error: HttpErrorResponse): boolean {
    return (
      error.status === 0 || // ERR_CONNECTION_RESET
      error.status === 503 || // Service Unavailable
      error.status === 502 || // Bad Gateway
      error.status === 504 || // Gateway Timeout
      error.message.includes('ERR_CONNECTION_RESET') ||
      error.message.includes('Connection reset')
    );
  }

  /**
   * Obtiene un mensaje de error amigable para el usuario
   */
  getErrorMessage(error: HttpErrorResponse): ErrorMessage {
    switch (error.status) {
      case 0:
        return {
          type: 'connection',
          title: 'Error de Conexión',
          message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
          actions: ['Reintentar', 'Contactar Soporte']
        };

      case 400:
        return {
          type: 'validation',
          title: 'Error de Validación',
          message: this.extractValidationMessage(error),
          actions: ['Revisar Datos']
        };

      case 401:
        return {
          type: 'validation',
          title: 'No Autorizado',
          message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          actions: ['Iniciar Sesión']
        };

      case 403:
        return {
          type: 'validation',
          title: 'Acceso Denegado',
          message: 'No tienes permisos para realizar esta acción.',
          actions: ['Contactar Administrador']
        };

      case 404:
        return {
          type: 'validation',
          title: 'No Encontrado',
          message: 'El recurso solicitado no fue encontrado.',
          actions: ['Volver']
        };

      case 500:
        return {
          type: 'server',
          title: 'Error del Servidor',
          message: 'Ocurrió un error interno. El equipo técnico ha sido notificado.',
          actions: ['Reintentar más tarde']
        };

      case 502:
        return {
          type: 'connection',
          title: 'Error de Gateway',
          message: 'El servidor está experimentando problemas. Intenta nuevamente.',
          actions: ['Reintentar']
        };

      case 503:
        return {
          type: 'connection',
          title: 'Servicio No Disponible',
          message: 'El servicio está temporalmente no disponible. Intenta en unos momentos.',
          actions: ['Reintentar más tarde']
        };

      case 504:
        return {
          type: 'connection',
          title: 'Tiempo de Espera Agotado',
          message: 'La solicitud tardó demasiado en procesarse. Intenta nuevamente.',
          actions: ['Reintentar']
        };

      default:
        return {
          type: 'unknown',
          title: 'Error Inesperado',
          message: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
          actions: ['Reintentar']
        };
    }
  }

  /**
   * Extrae mensaje de validación del error 400
   */
  private extractValidationMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error === 'object') {
      // Buscar mensajes de error específicos
      if (error.error.message) {
        return error.error.message;
      }

      if (error.error.detail) {
        return error.error.detail;
      }

      // Buscar errores de campo
      const fieldErrors = [];
      for (const [field, messages] of Object.entries(error.error)) {
        if (Array.isArray(messages)) {
          fieldErrors.push(`${field}: ${messages.join(', ')}`);
        } else if (typeof messages === 'string') {
          fieldErrors.push(`${field}: ${messages}`);
        }
      }

      if (fieldErrors.length > 0) {
        return fieldErrors.join('; ');
      }
    }

    return 'Los datos proporcionados no son válidos. Revisa la información e intenta nuevamente.';
  }

  /**
   * Determina si se debe reintentar automáticamente
   */
  shouldRetry(error: HttpErrorResponse): boolean {
    return this.isConnectionError(error) && error.status !== 401 && error.status !== 403;
  }

  /**
   * Obtiene el tiempo de espera antes del siguiente reintento
   */
  getRetryDelay(retryCount: number): number {
    return Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 segundos
  }
}
