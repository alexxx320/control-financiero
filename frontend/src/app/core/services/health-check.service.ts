import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {
  
  constructor(private http: HttpClient) {}

  /**
   * Verificar si el backend está disponible
   */
  checkBackendHealth(): Observable<boolean> {
    return this.http.get(`${environment.apiUrl}/health`, { responseType: 'json' })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  /**
   * Verificar conectividad completa
   */
  checkConnectivity(): Observable<{backend: boolean, database: boolean}> {
    return this.http.get<{backend: boolean, database: boolean}>(`${environment.apiUrl}/health/full`)
      .pipe(
        catchError(() => of({backend: false, database: false}))
      );
  }
}
