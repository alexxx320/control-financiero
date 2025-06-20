import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { environment } from '../../../environments/environment';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  statusCode?: number;
}

@Component({
  selector: 'app-test-connection',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule
  ],
  template: `
    <div class="test-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>network_check</mat-icon>
            Prueba de Conexión Frontend-Backend
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="info-section">
            <h3>Configuración Actual:</h3>
            <p><strong>API URL:</strong> {{ apiUrl }}</p>
            <p><strong>Frontend:</strong> http://localhost:4200</p>
            <p><strong>Backend:</strong> http://localhost:3000</p>
          </div>

          <div class="test-section">
            <button mat-raised-button color="primary" (click)="runTests()" [disabled]="testing">
              <mat-icon>play_arrow</mat-icon>
              {{ testing ? 'Probando...' : 'Ejecutar Pruebas' }}
            </button>
          </div>

          <div class="results-section" *ngIf="results.length > 0">
            <h3>Resultados:</h3>
            <mat-list>
              <mat-list-item *ngFor="let result of results">
                <mat-icon matListItemIcon [class]="getIconClass(result.status)">
                  {{ getIcon(result.status) }}
                </mat-icon>
                <div matListItemTitle>{{ result.endpoint }}</div>
                <div matListItemLine>
                  {{ result.message }}
                  <span *ngIf="result.statusCode"> (Status: {{ result.statusCode }})</span>
                </div>
              </mat-list-item>
            </mat-list>
          </div>

          <div class="summary-section" *ngIf="testCompleted">
            <mat-card [class]="getSummaryClass()">
              <mat-card-content>
                <h3>
                  <mat-icon>{{ getSummaryIcon() }}</mat-icon>
                  {{ getSummaryMessage() }}
                </h3>
                <div *ngIf="!allTestsPassed" class="troubleshooting">
                  <h4>Posibles soluciones:</h4>
                  <ul>
                    <li *ngIf="!backendReachable">
                      Verifica que el backend esté ejecutándose:
                      <code>cd backend && npm run start:dev</code>
                    </li>
                    <li *ngIf="!authWorking">
                      Verifica las credenciales de autenticación o la configuración JWT
                    </li>
                    <li *ngIf="corsError">
                      Verifica la configuración CORS en el backend
                    </li>
                  </ul>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .info-section {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .info-section p {
      margin: 5px 0;
    }

    .test-section {
      text-align: center;
      margin: 20px 0;
    }

    .results-section {
      margin-top: 20px;
    }

    .success-icon {
      color: #4caf50;
    }

    .error-icon {
      color: #f44336;
    }

    .pending-icon {
      color: #ff9800;
    }

    .summary-section {
      margin-top: 20px;
    }

    .summary-success {
      border-left: 4px solid #4caf50;
    }

    .summary-error {
      border-left: 4px solid #f44336;
    }

    .troubleshooting {
      margin-top: 15px;
    }

    .troubleshooting code {
      background-color: #f5f5f5;
      padding: 2px 5px;
      border-radius: 3px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  `]
})
export class TestConnectionComponent implements OnInit {
  apiUrl = environment.apiUrl;
  results: TestResult[] = [];
  testing = false;
  testCompleted = false;
  
  // Flags para el resumen
  backendReachable = false;
  authWorking = false;
  corsError = false;
  allTestsPassed = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Opcionalmente, ejecutar las pruebas automáticamente
    // this.runTests();
  }

  async runTests() {
    this.testing = true;
    this.testCompleted = false;
    this.results = [];
    this.resetFlags();

    // Prueba 1: Verificar si el backend responde
    await this.testBackendHealth();

    // Prueba 2: Verificar la documentación de Swagger
    await this.testSwaggerDocs();

    // Prueba 3: Verificar autenticación
    await this.testAuth();

    // Prueba 4: Verificar endpoints protegidos
    await this.testProtectedEndpoint();

    this.testing = false;
    this.testCompleted = true;
    this.evaluateResults();
  }

  private async testBackendHealth() {
    const result: TestResult = {
      endpoint: 'Backend Health Check',
      status: 'pending',
      message: 'Verificando conexión con el backend...'
    };
    this.results.push(result);

    try {
      const response = await this.http.get<any>('http://localhost:3000/api', { 
        observe: 'response' 
      }).toPromise();
      
      result.status = 'success';
      result.message = 'Backend está ejecutándose correctamente';
      result.statusCode = response?.status;
      this.backendReachable = true;
    } catch (error: any) {
      result.status = 'error';
      result.statusCode = error.status || 0;
      
      if (error.status === 0) {
        result.message = 'No se puede conectar con el backend. ¿Está ejecutándose?';
      } else {
        result.message = error.message || 'Error al conectar con el backend';
      }
      
      if (error.error?.message?.includes('CORS')) {
        this.corsError = true;
      }
    }
  }

  private async testSwaggerDocs() {
    const result: TestResult = {
      endpoint: 'API Documentation (Swagger)',
      status: 'pending',
      message: 'Verificando documentación de la API...'
    };
    this.results.push(result);

    try {
      const response = await this.http.get<any>(`${this.apiUrl}/docs`, { 
        observe: 'response',
        responseType: 'text' as 'json'
      }).toPromise();
      
      result.status = 'success';
      result.message = 'Documentación disponible en /api/docs';
      result.statusCode = response?.status;
    } catch (error: any) {
      result.status = 'error';
      result.statusCode = error.status || 0;
      result.message = 'No se puede acceder a la documentación';
    }
  }

  private async testAuth() {
    const result: TestResult = {
      endpoint: 'Autenticación (Login)',
      status: 'pending',
      message: 'Probando endpoint de login...'
    };
    this.results.push(result);

    try {
      const response = await this.http.post<any>(`${this.apiUrl}/auth/login`, {
        email: 'test@test.com',
        password: 'test123'
      }, { observe: 'response' }).toPromise();
      
      if (response?.body?.access_token) {
        result.status = 'success';
        result.message = 'Autenticación funcionando (modo desarrollo)';
        this.authWorking = true;
      } else {
        result.status = 'error';
        result.message = 'Respuesta de autenticación inválida';
      }
      result.statusCode = response?.status;
    } catch (error: any) {
      // En desarrollo, el error puede ser esperado si no hay usuarios
      if (error.status === 401) {
        result.status = 'success';
        result.message = 'Endpoint de autenticación responde correctamente';
        result.statusCode = error.status;
      } else {
        result.status = 'error';
        result.statusCode = error.status || 0;
        result.message = error.error?.message || 'Error en autenticación';
      }
    }
  }

  private async testProtectedEndpoint() {
    const result: TestResult = {
      endpoint: 'Endpoint Protegido (/api/fondos)',
      status: 'pending',
      message: 'Verificando endpoints protegidos...'
    };
    this.results.push(result);

    try {
      const response = await this.http.get<any>(`${this.apiUrl}/fondos`, { 
        observe: 'response' 
      }).toPromise();
      
      // Si responde con datos, está funcionando
      if (Array.isArray(response?.body)) {
        result.status = 'success';
        result.message = 'Endpoints protegidos accesibles';
      } else {
        result.status = 'success';
        result.message = 'Endpoint responde (requiere autenticación)';
      }
      result.statusCode = response?.status;
    } catch (error: any) {
      if (error.status === 401) {
        // 401 es esperado sin token
        result.status = 'success';
        result.message = 'Protección JWT funcionando correctamente';
        result.statusCode = error.status;
      } else {
        result.status = 'error';
        result.statusCode = error.status || 0;
        result.message = error.error?.message || 'Error al acceder al endpoint';
      }
    }
  }

  private resetFlags() {
    this.backendReachable = false;
    this.authWorking = false;
    this.corsError = false;
    this.allTestsPassed = false;
  }

  private evaluateResults() {
    const errorCount = this.results.filter(r => r.status === 'error').length;
    this.allTestsPassed = errorCount === 0 && this.backendReachable;
  }

  getIcon(status: string): string {
    switch (status) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      default: return 'pending';
    }
  }

  getIconClass(status: string): string {
    return `${status}-icon`;
  }

  getSummaryClass(): string {
    return this.allTestsPassed ? 'summary-success' : 'summary-error';
  }

  getSummaryIcon(): string {
    return this.allTestsPassed ? 'check_circle' : 'warning';
  }

  getSummaryMessage(): string {
    if (this.allTestsPassed) {
      return '¡Todas las pruebas pasaron! La conexión está funcionando correctamente.';
    } else if (!this.backendReachable) {
      return 'No se puede conectar con el backend. Verifica que esté ejecutándose.';
    } else {
      return 'Algunas pruebas fallaron. Revisa los detalles arriba.';
    }
  }
}
