import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FondoService } from '../../core/services/fondo.service';
import { Fondo, TipoFondo, CreateFondoDto, UpdateFondoDto } from '../../core/models/fondo.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-fondos',
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
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatChipsModule,
    MatGridListModule
  ],
  template: `
    <div class="fondos-container">
      <div class="header-section mb-2">
        <div class="header-content">
          <h2>Gestión de Fondos</h2>
          <button mat-raised-button color="primary" (click)="abrirDialogoFondo()">
            <mat-icon>add</mat-icon>
            Nuevo Fondo
          </button>
        </div>
      </div>

      <mat-card class="form-card mb-2" *ngIf="mostrarFormulario">
        <mat-card-header>
          <mat-card-title>{{ fondoEditando ? 'Editar Fondo' : 'Nuevo Fondo' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="fondoForm" (ngSubmit)="guardarFondo()" class="fondo-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre del Fondo</mat-label>
                <input matInput formControlName="nombre" placeholder="Ej: Fondo de Emergencia">
                <mat-error *ngIf="fondoForm.get('nombre')?.hasError('required')">
                  El nombre es requerido
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="descripcion" rows="3" 
                          placeholder="Descripción opcional del fondo"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Tipo de Fondo</mat-label>
                <mat-select formControlName="tipo">
                  <mat-option *ngFor="let tipo of tiposFondo" [value]="tipo">
                    {{ tipo | titlecase }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="fondoForm.get('tipo')?.hasError('required')">
                  El tipo es requerido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Saldo {{ fondoEditando ? 'Actual' : 'Inicial' }}</mat-label>
                <input matInput type="number" formControlName="saldoActual" 
                       placeholder="0" min="0" step="0.01">
                <span matTextPrefix>$</span>
                <mat-hint *ngIf="fondoEditando">
                  El saldo solo se modifica mediante transacciones
                </mat-hint>
                <mat-error *ngIf="fondoForm.get('saldoActual')?.hasError('required')">
                  El saldo inicial es requerido
                </mat-error>
                <mat-error *ngIf="fondoForm.get('saldoActual')?.hasError('min')">
                  El saldo debe ser mayor o igual a 0
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Meta de Ahorro (Opcional)</mat-label>
                <input matInput type="number" formControlName="metaAhorro" 
                       placeholder="0" min="0" step="0.01">
                <span matTextPrefix>$</span>
                <mat-hint>Define una meta opcional para este fondo</mat-hint>
                <mat-error *ngIf="fondoForm.get('metaAhorro')?.hasError('min')">
                  La meta debe ser mayor o igual a 0
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancelarEdicion()">
                Cancelar
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="fondoForm.invalid || guardando">
                {{ fondoEditando ? 'Actualizar' : 'Crear' }} Fondo
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <div class="fondos-grid">
        <mat-card *ngFor="let fondo of fondos" class="fondo-card">
          <mat-card-header>
            <div mat-card-avatar class="fondo-avatar">
              <mat-icon>{{ obtenerIconoTipo(fondo.tipo) }}</mat-icon>
            </div>
            <mat-card-title>{{ fondo.nombre }}</mat-card-title>
            <mat-card-subtitle>{{ fondo.tipo | titlecase }}</mat-card-subtitle>
            <div class="card-actions">
              <button mat-icon-button (click)="editarFondo(fondo)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="eliminarFondo(fondo)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </mat-card-header>
          
          <mat-card-content>
            <div class="fondo-info">
              <p *ngIf="fondo.descripcion" class="descripcion">{{ fondo.descripcion }}</p>
              
              <div class="saldo-info">
                <div class="saldo-label">Saldo Actual:</div>
                <div class="saldo-valor">{{ fondo.saldoActual | currency:'COP':'symbol':'1.0-0' }}</div>
              </div>

              <div class="meta-info" *ngIf="fondo.metaAhorro && fondo.metaAhorro > 0">
                <div class="meta-label">Meta de Ahorro:</div>
                <div class="meta-valor">{{ fondo.metaAhorro | currency:'COP':'symbol':'1.0-0' }}</div>
              </div>

              <div class="progreso-section" *ngIf="fondo.metaAhorro && fondo.metaAhorro > 0">
                <div class="progreso-header">
                  <span>Progreso hacia la meta:</span>
                  <span class="progreso-porcentaje">{{ calcularProgresoMeta(fondo) }}%</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="calcularProgresoMeta(fondo)">
                </mat-progress-bar>
              </div>

              <div class="fecha-creacion" *ngIf="fondo.fechaCreacion">
                Creado: {{ fondo.fechaCreacion | date:'dd/MM/yyyy' }}
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button color="primary" (click)="verDetalleFondo(fondo)">
              <mat-icon>visibility</mat-icon>
              Ver Detalle
            </button>
            <button mat-button color="accent" (click)="toggleEstadoFondo(fondo)">
              <mat-icon>settings</mat-icon>
              Estado
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="nuevo-fondo-card" (click)="abrirDialogoFondo()" 
                  *ngIf="!mostrarFormulario">
          <mat-card-content>
            <div class="nuevo-fondo-content">
              <mat-icon class="add-icon">add_circle_outline</mat-icon>
              <h3>Crear Nuevo Fondo</h3>
              <p>Agrega un nuevo fondo para organizar tus finanzas</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .fondos-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header-section {
      margin-bottom: 20px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h2 {
      margin: 0;
      font-weight: 500;
    }

    .form-card {
      margin-bottom: 20px;
    }

    .fondo-form {
      max-width: 600px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .fondos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .fondo-card {
      transition: all 0.3s ease;
      border-left: 4px solid #2196f3;
    }

    .fondo-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .fondo-card mat-card-header {
      position: relative;
    }

    .card-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 4px;
    }

    .fondo-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: white;
      background-color: #2196f3;
    }

    .fondo-info {
      margin-top: 16px;
    }

    .descripcion {
      color: rgba(0,0,0,0.6);
      margin-bottom: 16px;
      font-style: italic;
    }

    .meta-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      padding: 8px;
      background-color: rgba(0,0,0,0.05);
      border-radius: 4px;
    }

    .saldo-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      padding: 12px;
      background-color: rgba(33, 150, 243, 0.1);
      border-radius: 4px;
      border-left: 4px solid #2196f3;
    }

    .saldo-label, .meta-label {
      font-weight: 500;
    }

    .saldo-valor {
      font-weight: 600;
      color: #2196f3;
      font-size: 1.1em;
    }

    .meta-valor {
      font-weight: 600;
      color: #2196f3;
    }

    .progreso-section {
      margin: 16px 0;
    }

    .progreso-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9em;
    }

    .progreso-porcentaje {
      font-weight: 600;
    }

    .balance-info {
      text-align: center;
      margin-top: 8px;
      font-size: 0.9em;
      color: rgba(0,0,0,0.7);
    }

    .fecha-creacion {
      font-size: 0.8em;
      color: rgba(0,0,0,0.5);
      text-align: right;
      margin-top: 16px;
    }

    .nuevo-fondo-card {
      border: 2px dashed #ccc;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 200px;
      display: flex;
      align-items: center;
    }

    .nuevo-fondo-card:hover {
      border-color: #2196f3;
      background-color: rgba(33, 150, 243, 0.05);
    }

    .nuevo-fondo-content {
      text-align: center;
      width: 100%;
      color: rgba(0,0,0,0.6);
    }

    .add-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .nuevo-fondo-card:hover .add-icon {
      color: #2196f3;
    }

    @media (max-width: 768px) {
      .fondos-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .fondos-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }

      .card-actions {
        position: relative;
        top: auto;
        right: auto;
        margin-top: 8px;
      }
    }
  `]
})
export class FondosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  fondos: Fondo[] = [];
  tiposFondo: TipoFondo[] = [];
  fondoForm: FormGroup;
  mostrarFormulario = false;
  fondoEditando: Fondo | null = null;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private fondoService: FondoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService
  ) {
    this.fondoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      tipo: ['', Validators.required],
      saldoActual: [0, [Validators.required, Validators.min(0)]],
      metaAhorro: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.cargarTiposFondo();
    this.cargarFondos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTiposFondo(): void {
    this.tiposFondo = this.fondoService.obtenerTiposFondo();
  }

  cargarFondos(): void {
    console.log('🏦 Cargando fondos desde el backend...');
    
    this.fondoService.obtenerFondos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fondos) => {
          console.log('✅ Fondos cargados exitosamente:', fondos);
          this.fondos = fondos;
        },
        error: (error) => {
          console.error('❌ Error cargando fondos:', error);
          
          let mensaje = 'Error al cargar fondos';
          if (error.message) {
            mensaje = error.message;
          }
          
          this.notificationService.error(mensaje);
          this.fondos = [];
        }
      });
    
    // También suscribirse a cambios en tiempo real
    this.fondoService.fondos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(fondos => {
        this.fondos = fondos;
      });
  }

  abrirDialogoFondo(): void {
    this.mostrarFormulario = true;
    this.fondoEditando = null;
    this.fondoForm.reset();
    // Habilitar el campo saldoActual al crear
    this.fondoForm.get('saldoActual')?.enable();
  }

  editarFondo(fondo: Fondo): void {
    this.mostrarFormulario = true;
    this.fondoEditando = fondo;
    this.fondoForm.patchValue({
      nombre: fondo.nombre,
      descripcion: fondo.descripcion || '',
      tipo: fondo.tipo,
      saldoActual: fondo.saldoActual || 0,
      metaAhorro: fondo.metaAhorro || 0
    });
    
    // Deshabilitar el campo saldoActual al editar
    this.fondoForm.get('saldoActual')?.disable();
  }

  guardarFondo(): void {
    if (this.fondoForm.invalid || this.guardando) return;

    this.guardando = true;
    const fondoData = this.fondoForm.value;

    console.log('💾 Guardando fondo:', fondoData);

    if (this.fondoEditando) {
      // Actualizar fondo existente
      const updateData: UpdateFondoDto = {
        nombre: fondoData.nombre,
        descripcion: fondoData.descripcion,
        tipo: fondoData.tipo,
        metaAhorro: fondoData.metaAhorro || 0
      };

      this.fondoService.actualizarFondo(this.fondoEditando._id!, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (fondoActualizado) => {
            console.log('✅ Fondo actualizado:', fondoActualizado);
            this.notificationService.success('Fondo actualizado. Nota: El saldo solo se modifica mediante transacciones.');
            this.cancelarEdicion();
            this.guardando = false;
          },
          error: (error) => {
            console.error('❌ Error actualizando fondo:', error);
            this.manejarErrorGuardado(error);
          }
        });
    } else {
      // Crear nuevo fondo
      const createData: CreateFondoDto = {
        nombre: fondoData.nombre,
        descripcion: fondoData.descripcion,
        tipo: fondoData.tipo,
        saldoActual: fondoData.saldoActual || 0,
        metaAhorro: fondoData.metaAhorro || 0
      };

      this.fondoService.crearFondo(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (nuevoFondo) => {
            console.log('✅ Fondo creado:', nuevoFondo);
            this.notificationService.success('Fondo creado exitosamente');
            this.cancelarEdicion();
            this.guardando = false;
          },
          error: (error) => {
            console.error('❌ Error creando fondo:', error);
            this.manejarErrorGuardado(error);
          }
        });
    }
  }

  private manejarErrorGuardado(error: any): void {
    this.guardando = false;
    
    let mensaje = 'Error al guardar el fondo';
    if (error.message) {
      mensaje = error.message;
    }
    
    this.notificationService.error(mensaje);
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.fondoEditando = null;
    this.fondoForm.reset();
  }

  eliminarFondo(fondo: Fondo): void {
    console.log('🗑️ Iniciando eliminación de fondo en componente:', fondo);
    
    const confirmacion = confirm(`¿Está seguro de eliminar el fondo "${fondo.nombre}"?`);
    if (!confirmacion) {
      console.log('❌ Usuario canceló la eliminación de fondo');
      return;
    }

    console.log('✅ Usuario confirmó eliminación de fondo, procediendo...');

    this.fondoService.eliminarFondo(fondo._id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Fondo eliminado exitosamente en componente:', response);
          this.notificationService.success('Fondo eliminado exitosamente');
        },
        error: (error) => {
          console.error('❌ Error eliminando fondo en componente:', error);
          
          let mensaje = 'Error al eliminar el fondo';
          if (error.message) {
            mensaje = error.message;
          }
          
          this.notificationService.error(mensaje);
        }
      });
  }

  toggleEstadoFondo(fondo: Fondo): void {
    this.mostrarMensaje(`Estado del fondo "${fondo.nombre}" cambiado`);
  }

  verDetalleFondo(fondo: Fondo): void {
    this.mostrarMensaje(`Ver detalle del fondo "${fondo.nombre}"`);
  }

  obtenerIconoTipo(tipo: TipoFondo): string {
    const iconos = {
      'ahorro': 'savings',
      'inversion': 'trending_up',
      'emergencia': 'warning',
      'gastos': 'shopping_cart',
      'personal': 'person'
    };
    return iconos[tipo] || 'account_balance_wallet';
  }

  calcularProgresoMeta(fondo: Fondo): number {
    if (!fondo.metaAhorro || fondo.metaAhorro === 0) {
      return 0;
    }
    const progreso = (fondo.saldoActual / fondo.metaAhorro) * 100;
    return Math.min(Math.round(progreso), 100);
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000
    });
  }
}
