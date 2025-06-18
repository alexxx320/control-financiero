import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { AuthService, LoginDto } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>account_balance_wallet</mat-icon>
            Control Financiero
          </mat-card-title>
          <mat-card-subtitle>Inicia sesión para continuar</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="login()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="tu@email.com" autocomplete="email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                El email es requerido
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Ingresa un email válido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" autocomplete="current-password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                La contraseña es requerida
              </mat-error>
            </mat-form-field>

            <div class="form-options">
              <mat-checkbox formControlName="recordarme">
                Recordarme
              </mat-checkbox>
              
              <a href="#" (click)="recuperarPassword($event)" class="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <div class="login-actions">
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="loginForm.invalid || loading" class="full-width login-button">
                <mat-spinner *ngIf="loading" [diameter]="20"></mat-spinner>
                <mat-icon *ngIf="!loading">login</mat-icon>
                <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
              </button>
            </div>
          </form>

          <!-- Sección de diagnóstico -->
          <div class="diagnostico-section" *ngIf="mostrarDiagnostico">
            <mat-card class="diagnostico-card">
              <mat-card-header>
                <mat-card-title>Estado de Conectividad</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="status-item">
                  <mat-icon [color]="estadoBackend ? 'primary' : 'warn'">
                    {{ estadoBackend ? 'check_circle' : 'error' }}
                  </mat-icon>
                  <span>Backend: {{ estadoBackend ? 'Conectado' : 'Desconectado' }}</span>
                </div>
                <div class="status-item">
                  <mat-icon [color]="estadoMongoDB ? 'primary' : 'warn'">
                    {{ estadoMongoDB ? 'check_circle' : 'error' }}
                  </mat-icon>
                  <span>MongoDB: {{ estadoMongoDB ? 'Conectado' : 'Desconectado' }}</span>
                </div>
                <button mat-button color="primary" (click)="verificarConectividad()">
                  <mat-icon>refresh</mat-icon>
                  Verificar Nuevamente
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-card-content>

        <mat-divider></mat-divider>

        <mat-card-actions>
          <div class="register-section">
            <p>¿No tienes cuenta?</p>
            <button mat-stroked-button color="primary" routerLink="/register" class="full-width">
              <mat-icon>person_add</mat-icon>
              Crear Cuenta
            </button>
          </div>
        </mat-card-actions>

        <!-- Información de desarrollo -->
        <mat-card-footer>
          <div class="demo-info">
            <mat-icon>info</mat-icon>
            <div>
              <strong>Sistema Real:</strong>
              <p>Registra una cuenta nueva o usa credenciales existentes de la base de datos</p>
              <button mat-button (click)="toggleDiagnostico()" color="accent">
                {{ mostrarDiagnostico ? 'Ocultar' : 'Mostrar' }} Diagnóstico
              </button>
            </div>
          </div>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 450px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .login-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0;
    }

    .forgot-password {
      color: #1976d2;
      text-decoration: none;
      font-size: 0.9em;
    }

    .forgot-password:hover {
      text-decoration: underline;
    }

    .login-actions {
      margin-top: 16px;
    }

    .login-button {
      height: 48px;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .register-section {
      text-align: center;
      width: 100%;
      padding: 16px;
    }

    .register-section p {
      margin: 0 0 12px 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .register-section button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 44px;
    }

    .demo-info {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin: 16px;
      padding: 16px;
      background-color: rgba(33, 150, 243, 0.1);
      border-radius: 4px;
      color: #1976d2;
      font-size: 0.9em;
    }

    .demo-info mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-top: 2px;
    }

    .demo-info strong {
      display: block;
      margin-bottom: 4px;
    }

    .demo-info p {
      margin: 0 0 8px 0;
      font-size: 0.85em;
      opacity: 0.8;
    }

    .diagnostico-section {
      margin-top: 16px;
    }

    .diagnostico-card {
      background-color: rgba(0, 0, 0, 0.02);
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
      }

      .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  returnUrl = '/dashboard';
  mostrarDiagnostico = false;
  estadoBackend = false;
  estadoMongoDB = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      recordarme: [false]
    });
  }

  ngOnInit(): void {
    // Obtener la URL de retorno si existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }

    // Verificar conectividad inicial
    this.verificarConectividad();
  }

  login(): void {
    if (this.loginForm.invalid || this.loading) return;

    this.loading = true;
    const credentials: LoginDto = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    console.log('🔐 Intentando login con:', { email: credentials.email });

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso:', response);
        
        // CORREGIDO: Usar 'usuario' en lugar de 'user'
        const nombre = response.usuario.nombre || response.usuario.email.split('@')[0];
        this.notificationService.success(`¡Bienvenido, ${nombre}!`);
        
        // Redirigir a la URL original o al dashboard
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        
        let mensaje = 'Error al iniciar sesión';
        if (error.message) {
          mensaje = error.message;
        } else if (error.status === 401) {
          mensaje = 'Email o contraseña incorrectos';
        } else if (error.status === 0) {
          mensaje = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
        } else if (error.status === 500) {
          mensaje = 'Error del servidor. Verifica que MongoDB esté ejecutándose.';
        }
        
        this.notificationService.error(mensaje);
        this.mostrarDiagnostico = true; // Mostrar diagnóstico automáticamente en error
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  recuperarPassword(event: Event): void {
    event.preventDefault();
    this.notificationService.info('Función de recuperación de contraseña en desarrollo');
  }

  toggleDiagnostico(): void {
    this.mostrarDiagnostico = !this.mostrarDiagnostico;
    if (this.mostrarDiagnostico) {
      this.verificarConectividad();
    }
  }

  verificarConectividad(): void {
    console.log('🔍 Verificando conectividad...');
    
    // Verificar backend
    this.authService.verificarConectividad().subscribe({
      next: (conectado) => {
        this.estadoBackend = conectado;
        console.log('Backend:', conectado ? '✅ Conectado' : '❌ Desconectado');
      },
      error: () => {
        this.estadoBackend = false;
        console.log('Backend: ❌ Error de conexión');
      }
    });

    // Para MongoDB, intentamos hacer una petición que requiera DB
    this.authService.verificarEmailDisponible('test@conectividad.com').subscribe({
      next: () => {
        this.estadoMongoDB = true;
        console.log('MongoDB: ✅ Conectado');
      },
      error: (error) => {
        this.estadoMongoDB = error.status !== 0; // Si responde pero da error, MongoDB está conectado
        console.log('MongoDB:', this.estadoMongoDB ? '✅ Conectado' : '❌ Desconectado');
      }
    });
  }
}
