import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { AppInitializationService } from '../services/app-initialization.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppReadyGuard implements CanActivate {
  
  constructor(
    private appInitService: AppInitializationService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.appInitService.isInitialized$.pipe(
      filter(isInitialized => isInitialized), // Esperar hasta que esté inicializada
      take(1),
      map(() => {
        console.log('🛡️ AppReadyGuard: Aplicación lista, permitiendo acceso');
        return true;
      })
    );
  }
}
