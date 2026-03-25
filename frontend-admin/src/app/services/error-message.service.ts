import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ApiErrorHandlerService, ErrorMessage } from './api-error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private apiErrorHandler: ApiErrorHandlerService
  ) { }

  /**
   * Muestra un mensaje de error usando SnackBar
   */
  showError(error: HttpErrorResponse | string, duration: number = 5000): void {
    let errorMessage: ErrorMessage;

    if (typeof error === 'string') {
      errorMessage = {
        type: 'unknown',
        title: 'Error',
        message: error,
        actions: []
      };
    } else {
      errorMessage = this.apiErrorHandler.getErrorMessage(error);
    }

    this.snackBar.open(
      `${errorMessage.title}: ${errorMessage.message}`,
      'Cerrar',
      {
        duration,
        panelClass: [`error-snackbar`, `error-${errorMessage.type}`],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Muestra un mensaje de éxito
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(
      message,
      'Cerrar',
      {
        duration,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Muestra un mensaje de advertencia
   */
  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(
      message,
      'Cerrar',
      {
        duration,
        panelClass: ['warning-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Muestra un mensaje informativo
   */
  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(
      message,
      'Cerrar',
      {
        duration,
        panelClass: ['info-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Muestra un diálogo de error detallado
   */
  showDetailedError(error: HttpErrorResponse): void {
    const errorMessage = this.apiErrorHandler.getErrorMessage(error);

    // Aquí podrías abrir un diálogo personalizado con más detalles
    // Por ahora, usamos SnackBar con duración más larga
    this.snackBar.open(
      `${errorMessage.title}: ${errorMessage.message}`,
      'Cerrar',
      {
        duration: 8000,
        panelClass: [`error-snackbar`, `error-${errorMessage.type}`],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Maneja errores de conexión específicamente
   */
  handleConnectionError(error: HttpErrorResponse): void {
    if (this.apiErrorHandler.shouldRetry(error)) {
      this.showError(
        'Problema de conexión detectado. Reintentando automáticamente...',
        3000
      );
    } else {
      this.showDetailedError(error);
    }
  }

  /**
   * Maneja errores de elementos destacados específicamente
   */
  handleFeaturedItemError(error: HttpErrorResponse): void {
    if (error.status === 400) {
      // Error específico de elementos destacados
      const message = error.error?.message || error.error?.detail;
      if (message && message.includes('destacado')) {
        this.showWarning('Este vehículo ya está en la lista de destacados.');
        return;
      }
    }

    // Para otros errores, usar el manejo general
    this.showError(error);
  }
}
