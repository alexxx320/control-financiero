import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitializationService {
  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.isInitializedSubject.asObservable();

  private isAuthReadySubject = new BehaviorSubject<boolean>(false);
  public isAuthReady$ = this.isAuthReadySubject.asObservable();

  constructor(private authService: AuthService) {}

  async initializeApp(): Promise<void> {
    console.log('🚀 Inicializando aplicación...');
    
    try {
      // 1. Inicializar la sesión de auth
      console.log('🔐 Inicializando autenticación...');
      this.authService.inicializarSesion();
      
      // 2. Esperar un momento para que se procese la sesión
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 3. Marcar auth como listo
      this.isAuthReadySubject.next(true);
      console.log('✅ Autenticación lista');
      
      // 4. Esperar un poco más para que todo se estabilice
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 5. Marcar la app como inicializada
      this.isInitializedSubject.next(true);
      console.log('✅ Aplicación inicializada completamente');
      
    } catch (error) {
      console.error('❌ Error inicializando aplicación:', error);
      this.isInitializedSubject.next(true); // Continuar aunque haya errores
    }
  }

  markAsInitialized(): void {
    this.isInitializedSubject.next(true);
  }

  isAppInitialized(): boolean {
    return this.isInitializedSubject.value;
  }

  isAuthReady(): boolean {
    return this.isAuthReadySubject.value;
  }
}
