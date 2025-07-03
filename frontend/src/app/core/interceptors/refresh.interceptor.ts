import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, switchMap, finalize, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Solo manejar errores 401 en endpoints que no sean de auth
        if (error.status === 401 && !this.isAuthEndpoint(request.url)) {
          return this.handle401Error(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      console.log('🔄 Token expirado, intentando renovar...');

      return this.authService.refreshAccessToken().pipe(
        switchMap((authResponse: any) => {
          console.log('✅ Token renovado, reintentando request original');
          this.isRefreshing = false;
          this.refreshTokenSubject.next(authResponse.accessToken);
          
          // Reintentar el request original con el nuevo token
          return next.handle(this.addTokenToRequest(request, authResponse.accessToken));
        }),
        catchError((refreshError) => {
          console.error('❌ Error renovando token:', refreshError);
          this.isRefreshing = false;
          
          // Si el refresh falla, el AuthService ya manejó el logout
          return EMPTY;
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // Si ya se está renovando, esperar a que termine
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenToRequest(request, token));
        })
      );
    }
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/');
  }
}
