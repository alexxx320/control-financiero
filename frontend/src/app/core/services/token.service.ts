import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { filter, switchMap, catchError } from 'rxjs/operators';

export interface TokenInfo {
  token: string;
  expiresAt: number;
  isValid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_BUFFER = 2 * 60 * 1000; // 2 minutos antes de expirar
  
  private currentTokenSubject = new BehaviorSubject<string | null>(null);
  private tokenExpirationSubject = new BehaviorSubject<number | null>(null);

  public currentToken$ = this.currentTokenSubject.asObservable();
  public tokenExpiration$ = this.tokenExpirationSubject.asObservable();

  constructor() {
    this.initializeFromMemory();
    this.setupTokenRefreshTimer();
  }

  /**
   * Establecer nuevo access token
   */
  setAccessToken(token: string): void {
    this.currentTokenSubject.next(token);
    
    // Calcular tiempo de expiración
    const payload = this.decodeToken(token);
    if (payload?.exp) {
      const expirationTime = payload.exp * 1000; // Convertir a millisegundos
      this.tokenExpirationSubject.next(expirationTime);
    }
  }

  /**
   * Obtener access token actual
   */
  getAccessToken(): string | null {
    return this.currentTokenSubject.value;
  }

  /**
   * Verificar si el token está próximo a expirar
   */
  isTokenNearExpiration(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    const payload = this.decodeToken(token);
    if (!payload?.exp) return true;

    const expirationTime = payload.exp * 1000;
    const now = Date.now();
    
    return (expirationTime - now) <= this.REFRESH_BUFFER;
  }

  /**
   * Verificar si el token ha expirado
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    const payload = this.decodeToken(token);
    if (!payload?.exp) return true;

    return (payload.exp * 1000) <= Date.now();
  }

  /**
   * Obtener información del token
   */
  getTokenInfo(): TokenInfo | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    if (!payload?.exp) return null;

    return {
      token,
      expiresAt: payload.exp * 1000,
      isValid: !this.isTokenExpired()
    };
  }

  /**
   * Obtener CSRF token de las cookies
   */
  getCsrfToken(): string | null {
    return this.getCookie('csrf_token');
  }

  /**
   * Limpiar token
   */
  clearToken(): void {
    this.currentTokenSubject.next(null);
    this.tokenExpirationSubject.next(null);
  }

  /**
   * Obtener tiempo restante hasta expiración (en milisegundos)
   */
  getTimeUntilExpiration(): number {
    const expirationTime = this.tokenExpirationSubject.value;
    if (!expirationTime) return 0;
    
    return Math.max(0, expirationTime - Date.now());
  }

  /**
   * Observable que emite cuando el token necesita renovación
   */
  getTokenRefreshNeeded$(): Observable<boolean> {
    return interval(30000) // Verificar cada 30 segundos
      .pipe(
        filter(() => !!this.getAccessToken()),
        switchMap(() => [this.isTokenNearExpiration()])
      );
  }

  // Métodos privados

  private initializeFromMemory(): void {
    // El token se mantiene solo en memoria, no en localStorage
    // Se recuperará del servidor si hay un refresh token válido
  }

  private setupTokenRefreshTimer(): void {
    // Este observable será usado por el interceptor para renovación automática
    this.getTokenRefreshNeeded$().subscribe(needsRefresh => {
      if (needsRefresh) {
        console.log('🔄 Token necesita renovación automática');
        // El interceptor manejará la renovación
      }
    });
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }
}
