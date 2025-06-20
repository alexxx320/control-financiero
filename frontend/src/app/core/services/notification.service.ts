import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export interface NotificationConfig {
  message: string;
  action?: string;
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  constructor(private snackBar: MatSnackBar) {}

  show(config: NotificationConfig): void {
    const snackBarConfig: MatSnackBarConfig = {
      duration: config.duration || 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: config.type ? [`snackbar-${config.type}`] : []
    };

    this.snackBar.open(
      config.message,
      config.action || 'Cerrar',
      snackBarConfig
    );
  }

  success(message: string, action?: string, duration?: number): void {
    this.show({
      message,
      action,
      duration,
      type: 'success'
    });
  }

  // Alias para compatibilidad
  mostrarExito(message: string, action?: string, duration?: number): void {
    this.success(message, action, duration);
  }

  error(message: string, action?: string, duration?: number): void {
    this.show({
      message,
      action,
      duration: duration || 5000,
      type: 'error'
    });
  }

  // Alias para compatibilidad
  mostrarError(message: string, action?: string, duration?: number): void {
    this.error(message, action, duration);
  }

  warning(message: string, action?: string, duration?: number): void {
    this.show({
      message,
      action,
      duration: duration || 4000,
      type: 'warning'
    });
  }

  // Alias para compatibilidad
  mostrarAdvertencia(message: string, action?: string, duration?: number): void {
    this.warning(message, action, duration);
  }

  info(message: string, action?: string, duration?: number): void {
    this.show({
      message,
      action,
      duration,
      type: 'info'
    });
  }
}
