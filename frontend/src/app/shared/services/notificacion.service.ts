import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  constructor(private snackBar: MatSnackBar) {}

  mostrarExito(mensaje: string, duracion: number = 3000): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration,
      panelClass: ['success-snackbar']
    });
  }

  mostrarError(mensaje: string, duracion: number = 5000): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration,
      panelClass: ['error-snackbar']
    });
  }

  mostrarAdvertencia(mensaje: string, duracion: number = 4000): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration,
      panelClass: ['warning-snackbar']
    });
  }

  mostrarInfo(mensaje: string, duracion: number = 3000): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration,
      panelClass: ['info-snackbar']
    });
  }
}
