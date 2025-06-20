import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('🔥 Error HTTP Global:', {
        status: error.status,
        url: error.url,
        message: error.message,
        error: error.error
      });
      
      // Manejar errores específicos que no fueron manejados por otros interceptores
      if (error.status === 404) {
        notificationService.warning('Recurso no encontrado');
      } else if (error.status === 400) {
        const message = error.error?.message || 'Datos inválidos';
        notificationService.error(message);
      }
      
      return throwError(() => error);
    })
  );
};
