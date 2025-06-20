import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService, RegisterDto } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-register',
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
    RouterModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>person_add</mat-icon>
            Crear Cuenta
          </mat-card-title>
          <mat-card-subtitle>Únete a Control Financiero</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="register()" class="register-form">
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre" placeholder="Tu nombre">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="registerForm.get('nombre')?.hasError('required')">
                  El nombre es requerido
                </mat-error>
                <mat-error *ngIf="registerForm.get('nombre')?.hasError('minlength')">
                  Mínimo 2 caracteres
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Apellido (Opcional)</mat-label>
                <input matInput formControlName="apellido" placeholder="Tu apellido">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="tu@email.com">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                El email es requerido
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Ingresa un email válido
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('emailTaken')">
                Este email ya está registrado
              </mat-error>
              <mat-hint *ngIf="verificandoEmail" class="verificando-hint">
                <mat-spinner [diameter]="16"></mat-spinner>
                Verificando disponibilidad...
              </mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Teléfono (Opcional)</mat-label>
              <input matInput formControlName="telefono" placeholder="+57 300 123 4567">
              <mat-icon matSuffix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                La contraseña es requerida
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Mínimo 8 caracteres
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar Contraseña</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword">
              <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                Confirma tu contraseña
              </mat-error>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                Las contraseñas no coinciden
              </mat-error>
            </mat-form-field>

            <div class="checkbox-section">
              <mat-checkbox formControlName="aceptaTerminos">
                Acepto los 
                <a href="#" (click)="mostrarTerminos($event)">términos y condiciones</a>
              </mat-checkbox>
              <mat-error *ngIf="registerForm.get('aceptaTerminos')?.hasError('required') && registerForm.get('aceptaTerminos')?.touched">
                Debes aceptar los términos y condiciones
              </mat-error>
            </div>

            <div class="register-actions">
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="registerForm.invalid || loading" class="full-width">
                <mat-spinner *ngIf="loading" [diameter]="20"></mat-spinner>
                <span *ngIf="!loading">Crear Cuenta</span>
                <span *ngIf="loading">Creando cuenta...</span>
              </button>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <div class="login-link">
            ¿Ya tienes cuenta? 
            <a routerLink="/login" mat-button color="primary">Inicia Sesión</a>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      width: 100%;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .register-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .checkbox-section {
      margin: 8px 0;
    }

    .checkbox-section a {
      color: #1976d2;
      text-decoration: none;
    }

    .checkbox-section a:hover {
      text-decoration: underline;
    }

    .verificando-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .register-actions {
      margin-top: 16px;
    }

    .register-actions button {
      height: 48px;
      font-size: 16px;
    }

    .login-link {
      text-align: center;
      width: 100%;
      padding: 16px;
    }

    @media (max-width: 600px) {
      .register-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading = false;
  verificandoEmail = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: [''],
      email: ['', [Validators.required, Validators.email], [this.emailValidator.bind(this)]],
      telefono: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
      return null;
    }
  }

  /**
   * Validador asíncrono para verificar disponibilidad del email
   */
  emailValidator(control: AbstractControl) {
    if (!control.value || !control.value.includes('@')) {
      return of(null);
    }

    this.verificandoEmail = true;
    
    return control.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(email => {
        if (!email || !email.includes('@')) {
          this.verificandoEmail = false;
          return of(null);
        }
        
        return this.authService.verificarEmailDisponible(email).pipe(
          catchError(() => {
            this.verificandoEmail = false;
            return of(true); // En caso de error de conexión, asumir disponible
          })
        );
      })
    ).subscribe(disponible => {
      this.verificandoEmail = false;
      if (disponible === false) {
        control.setErrors({ emailTaken: true });
      }
    });
  }

  register(): void {
    if (this.registerForm.invalid || this.loading) return;

    this.loading = true;
    const formData = this.registerForm.value;
    
    const registerData: RegisterDto = {
      nombre: formData.nombre,
      apellido: formData.apellido || undefined,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono || undefined
    };

    console.log('📝 Intentando registro con:', { 
      email: registerData.email, 
      nombre: registerData.nombre 
    });

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('✅ Registro exitoso:', response);
        
        // CORREGIDO: Usar 'usuario' en lugar de 'user'
        this.notificationService.success(
          `¡Bienvenido, ${response.usuario.nombre}! Tu cuenta ha sido creada exitosamente.`
        );
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('❌ Error en registro:', error);
        
        let mensaje = 'Error al crear la cuenta';
        if (error.message) {
          mensaje = error.message;
        } else if (error.status === 400) {
          mensaje = error.error?.message || 'Los datos proporcionados no son válidos';
        } else if (error.status === 409) {
          mensaje = 'Este email ya está registrado';
        } else if (error.status === 0) {
          mensaje = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.';
        } else if (error.status === 500) {
          mensaje = 'Error del servidor. Verifica que MongoDB esté ejecutándose.';
        }
        
        this.notificationService.error(mensaje);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  mostrarTerminos(event: Event): void {
    event.preventDefault();
    this.notificationService.info('Los términos y condiciones están en desarrollo');
  }
}
