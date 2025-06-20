import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  
  let authReq = req;
  
  // Solo agregar el token a las peticiones a nuestra API
  if (req.url.includes(environment.apiUrl)) {
    const token = authService.getToken();
    
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ AuthInterceptor - Token agregado a:', req.url);
      console.log('🔑 Token (primeros 30 chars):', token.substring(0, 30) + '...');
    } else {
      console.warn('⚠️ AuthInterceptor - Sin token para:', req.url);
    }
  }
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Error HTTP interceptado:', {
        status: error.status,
        url: error.url,
        message: error.message,
        error: error.error
      });
      
      if (error.status === 401) {
        console.error('🚫 Error 401 - No autorizado en:', error.url);
        authService.logout();
        router.navigate(['/login']);
        notificationService.warning('Tu sesión ha expirado. Inicia sesión nuevamente.');
      } else if (error.status === 403) {
        notificationService.error('No tienes permisos para realizar esta acción');
      } else if (error.status === 0) {
        notificationService.warning('No se pudo conectar con el servidor. Verifica que esté ejecutándose.');
      } else if (error.status >= 500) {
        notificationService.error('Error del servidor. Intenta nuevamente.');
      }
      
      return throwError(() => error);
    })
  );
};
