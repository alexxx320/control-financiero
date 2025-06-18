import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    
    console.log('AuthInterceptor - Interceptando request a:', req.url);
    
    // Solo agregar el token a las peticiones a nuestra API
    if (req.url.includes(environment.apiUrl)) {
      const token = this.authService.getToken();
      
      console.log('AuthInterceptor - Token obtenido:', token ? token.substring(0, 20) + '...' : 'NO HAY TOKEN');
      
      if (token) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('AuthInterceptor - Header Authorization agregado');
      } else {
        console.log('AuthInterceptor - NO se agregó header (sin token)');
      }
    } else {
      console.log('AuthInterceptor - URL externa, no se agrega token');
    }
    
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('AuthInterceptor - Error interceptado:', {
          status: error.status,
          url: error.url,
          message: error.message
        });
        
        // Manejar errores de autenticación
        if (error.status === 401) {
          console.log('AuthInterceptor - Error 401, ejecutando handleUnauthorized');
          this.handleUnauthorized();
        } else if (error.status === 403) {
          this.notificationService.error('No tienes permisos para realizar esta acción');
        } else if (error.status === 0) {
          // Error de conexión
          this.notificationService.warning('No se pudo conectar con el servidor.');
        } else if (error.status >= 500) {
          this.notificationService.error('Error del servidor. Intenta nuevamente.');
        }
        
        return throwError(() => error);
      })
    );
  }

  private handleUnauthorized(): void {
    // Limpiar sesión y redirigir a login
    this.authService.logout();
    this.router.navigate(['/login']);
    this.notificationService.warning('Tu sesión ha expirado. Inicia sesión nuevamente.');
  }
}
