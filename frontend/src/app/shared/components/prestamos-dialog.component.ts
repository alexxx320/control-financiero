import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Fondo } from '../../core/models/fondo.model';
import { 
  Prestamo, 
  PagoPrestamo, 
  CreatePrestamoDto, 
  CreatePagoPrestamoDto,
  EstadisticasPrestamos,
  ResumenDeudor
} from '../../core/models/prestamo.model';
import { PrestamoService } from '../../core/services/prestamo.service';
import { NotificationService } from '../../core/services/notification.service';

export interface PrestamosDialogData {
  fondo: Fondo;
}

@Component({
  selector: 'app-prestamos-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  template: `
    <div class="prestamos-dialog">
      <h2 mat-dialog-title>
        <mat-icon>handshake</mat-icon>
        Gestión de Préstamos - {{ data.fondo.nombre }}
      </h2>

      <mat-dialog-content class="dialog-content">
        <mat-tab-group>
          <!-- TAB 1: RESUMEN Y ESTADÍSTICAS -->
          <mat-tab label="Resumen">
            <div class="tab-content">
              <!-- Estadísticas Generales -->
              <mat-card class="stats-card">
                <mat-card-header>
                  <mat-card-title>Estadísticas del Fondo</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="stats-grid" *ngIf="estadisticas">
                    <div class="stat-item">
                      <div class="stat-valor">{{ estadisticas.totalPrestamos }}</div>
                      <div class="stat-label">Total Préstamos</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-valor">{{ estadisticas.prestamosActivos }}</div>
                      <div class="stat-label">Activos</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-valor">{{ estadisticas.montoTotalPrestado | currency:'COP':'symbol':'1.0-0' }}</div>
                      <div class="stat-label">Total Prestado</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-valor">{{ estadisticas.saldoPendienteTotal | currency:'COP':'symbol':'1.0-0' }}</div>
                      <div class="stat-label">Por Cobrar</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-valor">{{ estadisticas.porcentajeRecuperacion.toFixed(1) }}%</div>
                      <div class="stat-label">% Recuperado</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-valor">{{ data.fondo.saldoActual | currency:'COP':'symbol':'1.0-0' }}</div>
                      <div class="stat-label">Disponible</div>
                    </div>
                  </div>

                  <!-- Barra de Progreso de Recuperación -->
                  <div class="progreso-recuperacion" *ngIf="estadisticas">
                    <div class="progreso-header">
                      <span>Progreso de Recuperación:</span>
                      <span class="progreso-porcentaje">{{ estadisticas.porcentajeRecuperacion.toFixed(1) }}%</span>
                    </div>
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="estadisticas.porcentajeRecuperacion"
                      [color]="estadisticas.porcentajeRecuperacion >= 80 ? 'primary' : 'warn'">
                    </mat-progress-bar>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Resumen por Deudor -->
              <mat-card class="deudores-card">
                <mat-card-header>
                  <mat-card-title>Resumen por Deudor</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="deudores-lista" *ngIf="resumenDeudores && resumenDeudores.length > 0; else noDeudores">
                    <div class="deudor-item" *ngFor="let deudor of resumenDeudores">
                      <div class="deudor-info">
                        <div class="deudor-nombre">{{ deudor.nombreDeudor }}</div>
                        <div class="deudor-stats">
                          <span class="stat">{{ deudor.totalPrestamos }} préstamo(s)</span>
                          <span class="stat">{{ deudor.saldoPendiente | currency:'COP':'symbol':'1.0-0' }} pendiente</span>
                        </div>
                      </div>
                      <div class="deudor-progreso">
                        <div class="progreso-valor">
                          {{ ((deudor.montoTotalAbonado / deudor.montoTotalPrestado) * 100).toFixed(1) }}%
                        </div>
                        <mat-progress-bar 
                          mode="determinate" 
                          [value]="(deudor.montoTotalAbonado / deudor.montoTotalPrestado) * 100">
                        </mat-progress-bar>
                      </div>
                    </div>
                  </div>
                  <ng-template #noDeudores>
                    <div class="empty-state">
                      <mat-icon>people_outline</mat-icon>
                      <p>No hay deudores registrados</p>
                      <p class="empty-subtitle">Crea tu primer préstamo en la pestaña "Préstamos"</p>
                    </div>
                  </ng-template>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- TAB 2: GESTIÓN DE PRÉSTAMOS -->
          <mat-tab label="Préstamos">
            <div class="tab-content">
              <!-- Formulario para Nuevo Préstamo -->
              <mat-card class="form-card">
                <mat-card-header>
                  <mat-card-title>Nuevo Préstamo</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="prestamoForm" (ngSubmit)="crearPrestamo()" class="prestamo-form">
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Nombre del Deudor</mat-label>
                        <input matInput formControlName="nombreDeudor" placeholder="Ej: Juan Pérez">
                        <mat-error *ngIf="prestamoForm.get('nombreDeudor')?.hasError('required')">
                          El nombre es requerido
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Contacto (Opcional)</mat-label>
                        <input matInput formControlName="contacto" placeholder="Teléfono o email">
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Monto a Prestar</mat-label>
                        <input matInput type="number" formControlName="montoOriginal" 
                               placeholder="0" min="1" step="1000">
                        <span matTextPrefix>$</span>
                        <mat-hint>Disponible: {{ data.fondo.saldoActual | currency:'COP':'symbol':'1.0-0' }}</mat-hint>
                        <mat-error *ngIf="prestamoForm.get('montoOriginal')?.hasError('required')">
                          El monto es requerido
                        </mat-error>
                        <mat-error *ngIf="prestamoForm.get('montoOriginal')?.hasError('max')">
                          No puedes prestar más de lo disponible
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Fecha de Vencimiento (Opcional)</mat-label>
                        <input matInput [matDatepicker]="vencimientoPicker" formControlName="fechaVencimiento">
                        <mat-datepicker-toggle matIconSuffix [for]="vencimientoPicker"></mat-datepicker-toggle>
                        <mat-datepicker #vencimientoPicker></mat-datepicker>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Descripción del Préstamo</mat-label>
                        <textarea matInput formControlName="descripcion" rows="2" 
                                  placeholder="Motivo del préstamo, condiciones, etc."></textarea>
                      </mat-form-field>
                    </div>

                    <div class="form-actions">
                      <button mat-raised-button color="primary" type="submit" 
                              [disabled]="prestamoForm.invalid || creando">
                        <mat-icon>add</mat-icon>
                        {{ creando ? 'Creando...' : 'Crear Préstamo' }}
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>

              <!-- Lista de Préstamos -->
              <mat-card class="prestamos-lista-card">
                <mat-card-header>
                  <mat-card-title>Préstamos Activos</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="prestamos-lista" *ngIf="prestamos && prestamos.length > 0; else noPrestamos">
                    <div class="prestamo-item" *ngFor="let prestamo of prestamos">
                      <div class="prestamo-header">
                        <div class="prestamo-deudor">
                          <mat-icon>person</mat-icon>
                          <span class="nombre">{{ prestamo.nombreDeudor }}</span>
                          <mat-chip class="estado-chip" 
                                   [ngClass]="obtenerClaseEstado(prestamo.estado)">
                            {{ prestamo.estado | titlecase }}
                          </mat-chip>
                        </div>
                        <div class="prestamo-monto">
                          {{ prestamo.montoOriginal | currency:'COP':'symbol':'1.0-0' }}
                        </div>
                      </div>

                      <div class="prestamo-progreso">
                        <div class="progreso-info">
                          <span>Pagado: {{ prestamo.montoAbonado | currency:'COP':'symbol':'1.0-0' }}</span>
                          <span>Pendiente: {{ calcularSaldoPendiente(prestamo) | currency:'COP':'symbol':'1.0-0' }}</span>
                        </div>
                        <mat-progress-bar 
                          mode="determinate" 
                          [value]="calcularPorcentajePagado(prestamo)">
                        </mat-progress-bar>
                      </div>

                      <div class="prestamo-acciones">
                        <button mat-button color="primary" (click)="abrirRegistroPago(prestamo)"
                                [disabled]="prestamo.estado === 'pagado'">
                          <mat-icon>payment</mat-icon>
                          Registrar Pago
                        </button>
                        <button mat-button (click)="verDetallesPrestamo(prestamo)">
                          <mat-icon>visibility</mat-icon>
                          Ver Detalles
                        </button>
                        <button mat-icon-button color="warn" (click)="eliminarPrestamo(prestamo)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                  <ng-template #noPrestamos>
                    <div class="empty-state">
                      <mat-icon>account_balance_wallet</mat-icon>
                      <p>No hay préstamos registrados</p>
                      <p class="empty-subtitle">Crea tu primer préstamo usando el formulario de arriba</p>
                    </div>
                  </ng-template>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cerrar()">Cerrar</button>
        <button mat-raised-button color="primary" (click)="actualizarDatos()">
          <mat-icon>refresh</mat-icon>
          Actualizar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .prestamos-dialog {
      width: 100%;
      max-width: 1000px;
    }

    .dialog-content {
      min-height: 600px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .tab-content {
      padding: 20px 0;
    }

    /* Estadísticas */
    .stats-card {
      margin-bottom: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      background-color: rgba(0,0,0,0.03);
      border-radius: 8px;
    }

    .stat-valor {
      font-size: 1.4em;
      font-weight: 600;
      color: #ff9800;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.9em;
      color: rgba(0,0,0,0.6);
    }

    .progreso-recuperacion {
      margin-top: 16px;
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

    /* Deudores */
    .deudores-card {
      margin-bottom: 20px;
    }

    .deudores-lista {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .deudor-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 8px;
      background-color: rgba(0,0,0,0.02);
    }

    .deudor-info {
      flex: 1;
    }

    .deudor-nombre {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .deudor-stats {
      display: flex;
      gap: 12px;
      font-size: 0.85em;
      color: rgba(0,0,0,0.6);
    }

    .deudor-progreso {
      min-width: 150px;
      text-align: right;
    }

    .progreso-valor {
      font-size: 0.9em;
      font-weight: 600;
      margin-bottom: 4px;
    }

    /* Formulario */
    .form-card {
      margin-bottom: 20px;
    }

    .prestamo-form {
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
      justify-content: flex-end;
      margin-top: 16px;
    }

    /* Lista de Préstamos */
    .prestamos-lista-card {
      margin-bottom: 20px;
    }

    .prestamos-lista {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .prestamo-item {
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 8px;
      padding: 16px;
      background-color: rgba(0,0,0,0.02);
    }

    .prestamo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .prestamo-deudor {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .prestamo-deudor .nombre {
      font-weight: 500;
    }

    .prestamo-monto {
      font-size: 1.1em;
      font-weight: 600;
      color: #ff9800;
    }

    .prestamo-progreso {
      margin-bottom: 12px;
    }

    .progreso-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.9em;
      margin-bottom: 8px;
    }

    .prestamo-acciones {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    /* Estados */
    .estado-chip {
      font-size: 0.8em;
      min-height: 24px;
    }

    .estado-activo {
      background-color: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    .estado-pagado {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .estado-vencido {
      background-color: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .estado-parcial {
      background-color: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: rgba(0,0,0,0.6);
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-subtitle {
      font-size: 0.9em;
      margin-top: 8px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .deudor-item {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .deudor-progreso {
        min-width: auto;
        text-align: left;
      }

      .prestamo-header {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .prestamo-acciones {
        justify-content: center;
        flex-wrap: wrap;
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
export class PrestamosDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  prestamoForm: FormGroup;
  prestamos: Prestamo[] = [];
  estadisticas: EstadisticasPrestamos | null = null;
  resumenDeudores: ResumenDeudor[] = [];
  creando = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PrestamosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PrestamosDialogData,
    private prestamoService: PrestamoService,
    private notificationService: NotificationService
  ) {
    this.prestamoForm = this.fb.group({
      nombreDeudor: ['', [Validators.required, Validators.minLength(2)]],
      contacto: [''],
      montoOriginal: [0, [Validators.required, Validators.min(1), Validators.max(this.data.fondo.saldoActual)]],
      fechaVencimiento: [''],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos(): void {
    this.cargarPrestamos();
    this.cargarEstadisticas();
    this.cargarResumenDeudores();
  }

  cargarPrestamos(): void {
    this.prestamoService.obtenerPrestamos(this.data.fondo._id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prestamos) => {
          this.prestamos = prestamos;
        },
        error: (error) => {
          console.error('Error cargando préstamos:', error);
          this.notificationService.error('Error al cargar préstamos');
        }
      });
  }

  cargarEstadisticas(): void {
    this.prestamoService.obtenerEstadisticas(this.data.fondo._id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.estadisticas = stats;
        },
        error: (error) => {
          console.error('Error cargando estadísticas:', error);
        }
      });
  }

  cargarResumenDeudores(): void {
    this.prestamoService.obtenerResumenDeudores(this.data.fondo._id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resumen) => {
          this.resumenDeudores = resumen;
        },
        error: (error) => {
          console.error('Error cargando resumen de deudores:', error);
        }
      });
  }

  crearPrestamo(): void {
    if (this.prestamoForm.invalid || this.creando) return;

    this.creando = true;
    const formData = this.prestamoForm.value;

    const createDto: CreatePrestamoDto = {
      fondoId: this.data.fondo._id!,
      nombreDeudor: formData.nombreDeudor,
      contacto: formData.contacto,
      montoOriginal: formData.montoOriginal,
      fechaVencimiento: formData.fechaVencimiento,
      descripcion: formData.descripcion
    };

    this.prestamoService.crearPrestamo(createDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prestamo) => {
          this.notificationService.success(`Préstamo para ${prestamo.nombreDeudor} creado exitosamente`);
          this.prestamoForm.reset();
          this.cargarDatos();
          this.creando = false;
        },
        error: (error) => {
          console.error('Error creando préstamo:', error);
          this.notificationService.error('Error al crear préstamo');
          this.creando = false;
        }
      });
  }

  abrirRegistroPago(prestamo: Prestamo): void {
    // TODO: Implementar diálogo para registrar pago
    this.notificationService.info('Funcionalidad de registro de pagos próximamente');
  }

  verDetallesPrestamo(prestamo: Prestamo): void {
    // TODO: Implementar diálogo con detalles del préstamo
    this.notificationService.info('Vista de detalles del préstamo próximamente');
  }

  eliminarPrestamo(prestamo: Prestamo): void {
    const confirmacion = confirm(`¿Eliminar préstamo de ${prestamo.nombreDeudor}?`);
    if (!confirmacion) return;

    this.prestamoService.eliminarPrestamo(prestamo._id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Préstamo eliminado exitosamente');
          this.cargarDatos();
        },
        error: (error) => {
          console.error('Error eliminando préstamo:', error);
          this.notificationService.error('Error al eliminar préstamo');
        }
      });
  }

  calcularSaldoPendiente(prestamo: Prestamo): number {
    return prestamo.montoOriginal - prestamo.montoAbonado;
  }

  calcularPorcentajePagado(prestamo: Prestamo): number {
    return (prestamo.montoAbonado / prestamo.montoOriginal) * 100;
  }

  obtenerClaseEstado(estado: string): string {
    return `estado-${estado}`;
  }

  actualizarDatos(): void {
    this.cargarDatos();
    this.notificationService.success('Datos actualizados');
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
