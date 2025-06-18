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

  error(message: string, action?: string, duration?: number): void {
    this.show({
      message,
      action,
      duration: duration || 5000,
      type: 'error'
    });
  }

  warning(message: string, action?: string, duration?: number): void {
    this.show({
      message,
      action,
      duration: duration || 4000,
      type: 'warning'
    });
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
