import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol?: string;
  telefono?: string;
  avatar?: string;
  fechaRegistro?: Date;
  ultimoLogin?: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface AuthResponse {
  access_token: string;
  usuario: Usuario; // CORREGIDO: 'usuario' en lugar de 'user'
  expires_in?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.verificarSesionExistente();
  }

  /**
   * Verificar si hay una sesión activa al inicializar el servicio
   */
  private verificarSesionExistente(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      console.log('🔍 Verificando token existente con el servidor...');
      
      // Verificar si el token es válido obteniendo el perfil
      this.obtenerPerfil().subscribe({
        next: (user) => {
          console.log('✅ Token válido, usuario autenticado:', user);
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);
        },
        error: (error) => {
          console.error('❌ Token inválido, limpiando sesión:', error);
          this.limpiarSesion();
        }
      });
    } else {
      console.log('🚫 No hay token válido guardado');
      this.limpiarSesion();
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Iniciar sesión
   */
  login(credentials: LoginDto): Observable<AuthResponse> {
    console.log('🔐 Intentando login con:', { email: credentials.email });
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Login exitoso - respuesta completa:', response);
          console.log('🎩 Token recibido:', response.access_token.substring(0, 20) + '...');
          console.log('👤 Usuario recibido:', response.usuario);
          
          this.setToken(response.access_token);
          this.currentUserSubject.next(response.usuario);
          this.isLoggedInSubject.next(true);
          
          console.log('💾 Token guardado en localStorage');
          console.log('📋 Estado actualizado - isLoggedIn: true');
        }),
        catchError(error => {
          console.error('❌ Error en login - NO se usará fallback:', error);
          
          let mensaje = 'Error de autenticación';
          if (error.status === 0) {
            mensaje = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.';
          } else if (error.status === 401) {
            mensaje = 'Credenciales incorrectas. Verifica tu email y contraseña.';
          } else if (error.status === 500) {
            mensaje = 'Error interno del servidor. Verifica que MongoDB esté ejecutándose.';
          }
          
          return throwError(() => ({
            ...error,
            message: mensaje
          }));
        })
      );
  }

  /**
   * Registrar nuevo usuario
   */
  register(userData: RegisterDto): Observable<AuthResponse> {
    console.log('📝 Intentando registro con:', { email: userData.email, nombre: userData.nombre });
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, userData)
      .pipe(
        tap(response => {
          console.log('✅ Registro exitoso:', response);
          this.setToken(response.access_token);
          this.currentUserSubject.next(response.usuario);
          this.isLoggedInSubject.next(true);
        }),
        catchError(error => {
          console.error('❌ Error en registro - NO se usará fallback:', error);
          
          let mensaje = 'Error en el registro';
          if (error.status === 0) {
            mensaje = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.';
          } else if (error.status === 400) {
            mensaje = error.error?.message || 'Datos inválidos. Verifica la información ingresada.';
          } else if (error.status === 500) {
            mensaje = 'Error interno del servidor. Verifica que MongoDB esté ejecutándose.';
          }
          
          return throwError(() => ({
            ...error,
            message: mensaje
          }));
        })
      );
  }

  /**
   * Obtener perfil del usuario actual
   */
  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/perfil`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener perfil:', error);
          throw error;
        })
      );
  }

  /**
   * Verificar si un email está disponible
   */
  verificarEmailDisponible(email: string): Observable<boolean> {
    if (!email || email.trim() === '') {
      return of(true); // Email vacío se considera disponible
    }
    
    return this.http.post<{disponible: boolean}>(`${this.apiUrl}/verificar-email`, { email })
      .pipe(
        map(response => response?.disponible ?? true),
        catchError((error) => {
          console.error('Error verificando email:', error);
          return of(true); // En caso de error, asumir que está disponible
        })
      );
  }

  /**
   * Cambiar contraseña
   */
  cambiarPassword(passwordActual: string, passwordNueva: string): Observable<{message: string}> {
    return this.http.patch<{message: string}>(`${this.apiUrl}/cambiar-password`, {
      passwordActual,
      passwordNueva
    });
  }

  /**
   * Renovar token
   */
  renovarToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/renovar-token`, {})
      .pipe(
        tap(response => {
          this.setToken(response.access_token);
          this.currentUserSubject.next(response.usuario);
        })
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    const token = this.getToken();
    console.log('🚪 Cerrando sesión...');
    
    if (token) {
      // Llamar al endpoint de logout
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => {
          console.log('✅ Logout exitoso en servidor');
          this.limpiarSesion();
        },
        error: (error) => {
          console.error('❌ Error en logout del servidor:', error);
          // Limpiar sesión local aunque falle el logout del servidor
          this.limpiarSesion();
        }
      });
    } else {
      this.limpiarSesion();
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('🚫 isAuthenticated: No hay token');
      return false;
    }
    
    // Verificar si el token no ha expirado
    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      const isValid = payload.exp > now;
      
      if (!isValid) {
        console.log('⏰ Token expirado, limpiando sesión');
        this.limpiarSesion();
      } else {
        console.log('✅ Token válido');
      }
      
      return isValid;
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
      this.limpiarSesion();
      return false;
    }
  }

  /**
   * Obtener token del localStorage
   */
  getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    // Solo hacer log cuando es necesario para debugging
    return token;
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Guardar token en localStorage
   */
  private setToken(token: string): void {
    console.log('💾 Guardando token en localStorage:', token.substring(0, 20) + '...');
    localStorage.setItem('auth_token', token);
    console.log('✅ Token guardado exitosamente');
  }

  /**
   * Limpiar sesión completa
   */
  private limpiarSesion(): void {
    console.log('🧽 Limpiando sesión completa...');
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    console.log('✅ Sesión limpiada - usuario deslogueado');
  }

  /**
   * Decodificar token JWT (sin verificación)
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decodificando token:', error);
      return {};
    }
  }

  /**
   * Método para verificar conectividad con el backend
   */
  verificarConectividad(): Observable<boolean> {
    // Intentar el endpoint de test de auth
    return this.http.get('http://localhost:3000/api/auth/test', { responseType: 'json' })
      .pipe(
        map((response: any) => {
          console.log('✅ Backend auth disponible:', response);
          return true;
        }),
        catchError((error) => {
          console.error('❌ Backend auth test falló:', error);
          // Intentar endpoint básico
          return this.http.get('http://localhost:3000/api/health', { responseType: 'json' })
            .pipe(
              map((response: any) => {
                console.log('✅ Backend health disponible:', response);
                return true;
              }),
              catchError((healthError) => {
                console.error('❌ Backend completamente no disponible');
                return of(false);
              })
            );
        })
      );
  }
}
