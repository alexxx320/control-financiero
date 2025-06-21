import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Fondo } from '../../core/models/fondo.model';
import { Transaccion, TipoTransaccion } from '../../core/models/transaccion.model';
import { TransaccionService } from '../../core/services/transaccion.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-fondo-detalle-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="detalle-modal">
      <!-- Header del Modal -->
      <div class="modal-header">
        <div class="header-content">
          <div class="fondo-icon">
            <mat-icon>{{ obtenerIconoTipo(fondo.tipo) }}</mat-icon>
          </div>
          <div class="header-info">
            <h2 mat-dialog-title>{{ fondo.nombre }}</h2>
            <div class="fondo-tipo">
              <mat-chip [class]="'chip-' + fondo.tipo">
                {{ fondo.tipo === 'registro' ? '📝 Registro' : '💰 Ahorro' }}
              </mat-chip>
            </div>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content">
        <!-- Información del Fondo -->
        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">{{ fondo.saldoActual >= 0 ? 'Saldo Actual' : 'Deuda Actual' }}</div>
                <div class="info-value" [class]="fondo.saldoActual >= 0 ? 'saldo' : 'deuda'">
                  {{ (fondo.saldoActual >= 0 ? fondo.saldoActual : -fondo.saldoActual) | currency:'COP':'symbol':'1.0-0' }}
                </div>
              </div>
              
              <div class="info-item" *ngIf="fondo.metaAhorro && fondo.metaAhorro > 0">
                <div class="info-label">Meta de Ahorro</div>
                <div class="info-value meta">{{ fondo.metaAhorro | currency:'COP':'symbol':'1.0-0' }}</div>
              </div>
              
              <div class="info-item">
                <div class="info-label">Fecha de Creación</div>
                <div class="info-value">{{ fondo.fechaCreacion | date:'dd/MM/yyyy' }}</div>
              </div>
              
              <div class="info-item" *ngIf="fondo.descripcion">
                <div class="info-label">Descripción</div>
                <div class="info-value descripcion">{{ fondo.descripcion }}</div>
              </div>
            </div>

            <!-- Progreso hacia la meta (solo para fondos de ahorro con saldo positivo) -->
            <div class="progreso-section" *ngIf="fondo.metaAhorro && fondo.metaAhorro > 0 && fondo.saldoActual > 0">
              <div class="progreso-header">
                <span>Progreso hacia la meta</span>
                <span class="progreso-porcentaje">{{ calcularProgresoMeta() }}%</span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="calcularProgresoMeta()"
                [class]="'progreso-' + obtenerClaseProgreso()">
              </mat-progress-bar>
              <div class="progreso-info">
                <span class="restante" *ngIf="calcularProgresoMeta() < 100">
                  Faltan: {{ (fondo.metaAhorro! - fondo.saldoActual) | currency:'COP':'symbol':'1.0-0' }}
                </span>
                <span class="completada" *ngIf="calcularProgresoMeta() >= 100">
                  🎉 ¡Meta completada! Excedente: {{ (fondo.saldoActual - fondo.metaAhorro!) | currency:'COP':'symbol':'1.0-0' }}
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-divider></mat-divider>

        <!-- Sección de Transacciones Recientes -->
        <div class="transacciones-section">
          <div class="section-header">
            <h3>
              <mat-icon>receipt_long</mat-icon>
              Transacciones Recientes
            </h3>
            <div class="transacciones-count" *ngIf="!cargandoTransacciones">
              {{ transacciones.length }} de últimas 10
            </div>
          </div>

          <!-- Loading -->
          <div class="loading-container" *ngIf="cargandoTransacciones">
            <mat-progress-spinner diameter="40" mode="indeterminate"></mat-progress-spinner>
            <p>Cargando transacciones...</p>
          </div>

          <!-- Lista de Transacciones -->
          <div class="transacciones-lista" *ngIf="!cargandoTransacciones">
            <div 
              class="transaccion-item" 
              *ngFor="let transaccion of transacciones; trackBy: trackByTransaccion"
              [class]="'transaccion-' + transaccion.tipo">
              
              <div class="transaccion-icon">
                <mat-icon [class]="'icon-' + transaccion.tipo">
                  {{ obtenerIconoTransaccion(transaccion.tipo, transaccion.categoria) }}
                </mat-icon>
              </div>
              
              <div class="transaccion-info">
                <div class="transaccion-descripcion">{{ transaccion.descripcion }}</div>
                <div class="transaccion-detalles">
                  <span class="categoria">{{ formatearCategoria(transaccion.categoria) }}</span>
                  <span class="fecha">{{ transaccion.fecha | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="transaccion-notas" *ngIf="transaccion.notas">
                  {{ transaccion.notas }}
                </div>
              </div>
              
              <div class="transaccion-monto" [class]="'monto-' + transaccion.tipo">
                <span class="signo">{{ transaccion.tipo === 'ingreso' ? '+' : '-' }}</span>
                {{ transaccion.monto | currency:'COP':'symbol':'1.0-0' }}
              </div>
            </div>

            <!-- Mensaje si no hay transacciones -->
            <div class="sin-transacciones" *ngIf="transacciones.length === 0">
              <mat-icon>receipt</mat-icon>
              <h4>Sin transacciones</h4>
              <p>Este fondo aún no tiene movimientos registrados.</p>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <!-- Acciones del Modal -->
      <mat-dialog-actions class="modal-actions">
        <button mat-raised-button color="primary" mat-dialog-close>
          <mat-icon>close</mat-icon>
          Cerrar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .detalle-modal {
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px 24px 16px;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .fondo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #2196f3;
      color: white;
    }

    .fondo-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .header-info h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 500;
    }

    .chip-registro {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .chip-ahorro {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .modal-content {
      padding: 0 !important;
      max-height: calc(90vh - 140px);
      overflow-y: auto;
    }

    .info-card {
      margin: 16px 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .info-item {
      text-align: center;
    }

    .info-label {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      text-transform: uppercase;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 16px;
      font-weight: 500;
    }

    .info-value.saldo {
      color: #2196f3;
      font-size: 18px;
      font-weight: 600;
    }

    .info-value.deuda {
      color: #f44336;
      font-size: 18px;
      font-weight: 600;
    }

    .info-value.meta {
      color: #4caf50;
      font-size: 18px;
      font-weight: 600;
    }

    .info-value.descripcion {
      font-style: italic;
      color: rgba(0,0,0,0.7);
      font-size: 14px;
    }

    .progreso-section {
      margin-top: 20px;
      padding: 16px;
      background-color: rgba(76, 175, 80, 0.05);
      border-radius: 8px;
      border-left: 4px solid #4caf50;
    }

    .progreso-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    .progreso-porcentaje {
      color: #4caf50;
      font-weight: 600;
    }

    .progreso-bajo {
      --mdc-linear-progress-active-indicator-color: #f44336;
    }

    .progreso-medio {
      --mdc-linear-progress-active-indicator-color: #ff9800;
    }

    .progreso-alto {
      --mdc-linear-progress-active-indicator-color: #4caf50;
    }

    .progreso-info {
      margin-top: 8px;
      text-align: right;
      font-size: 12px;
    }

    .restante {
      color: rgba(0,0,0,0.6);
    }

    .completada {
      color: #4caf50;
      font-weight: 600;
    }

    .transacciones-section {
      padding: 16px 24px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .transacciones-count {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      background-color: rgba(0,0,0,0.05);
      padding: 4px 8px;
      border-radius: 12px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px;
      color: rgba(0,0,0,0.6);
    }

    .transacciones-lista {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .transaccion-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid;
      transition: all 0.2s ease;
    }

    .transaccion-item:hover {
      background-color: rgba(0,0,0,0.02);
      transform: translateX(2px);
    }

    .transaccion-ingreso {
      background-color: rgba(76, 175, 80, 0.05);
      border-left-color: #4caf50;
    }

    .transaccion-gasto {
      background-color: rgba(244, 67, 54, 0.05);
      border-left-color: #f44336;
    }

    .transaccion-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .icon-ingreso {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .icon-gasto {
      background-color: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .transaccion-info {
      flex: 1;
      min-width: 0;
    }

    .transaccion-descripcion {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .transaccion-detalles {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: rgba(0,0,0,0.6);
    }

    .categoria {
      background-color: rgba(0,0,0,0.08);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }

    .transaccion-notas {
      font-size: 11px;
      color: rgba(0,0,0,0.5);
      font-style: italic;
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .transaccion-monto {
      font-weight: 600;
      font-size: 14px;
      text-align: right;
      flex-shrink: 0;
    }

    .monto-ingreso {
      color: #4caf50;
    }

    .monto-gasto {
      color: #f44336;
    }

    .signo {
      font-weight: 700;
    }

    .sin-transacciones {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px;
      text-align: center;
      color: rgba(0,0,0,0.5);
    }

    .sin-transacciones mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.3;
    }

    .sin-transacciones h4 {
      margin: 0;
      font-weight: 500;
    }

    .sin-transacciones p {
      margin: 0;
      font-size: 14px;
    }

    .modal-actions {
      padding: 16px 24px;
      border-top: 1px solid rgba(0,0,0,0.1);
      justify-content: center;
    }

    @media (max-width: 600px) {
      .detalle-modal {
        width: 100vw;
        height: 100vh;
        max-width: none;
        max-height: none;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .modal-header {
        padding: 16px;
      }

      .transacciones-section {
        padding: 16px;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .transaccion-item {
        padding: 8px;
      }

      .transaccion-descripcion {
        font-size: 13px;
      }

      .transaccion-monto {
        font-size: 13px;
      }
    }
  `]
})
export class FondoDetalleModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  transacciones: Transaccion[] = [];
  cargandoTransacciones = true;

  constructor(
    public dialogRef: MatDialogRef<FondoDetalleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public fondo: Fondo,
    private transaccionService: TransaccionService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarTransacciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTransacciones(): void {
    this.cargandoTransacciones = true;
    
    this.transaccionService.obtenerTransaccionesPorFondo(this.fondo._id!, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transacciones) => {
          console.log('✅ Transacciones del fondo cargadas:', transacciones);
          this.transacciones = transacciones;
          this.cargandoTransacciones = false;
        },
        error: (error) => {
          console.error('❌ Error cargando transacciones:', error);
          this.notificationService.error('Error al cargar las transacciones del fondo');
          this.cargandoTransacciones = false;
        }
      });
  }

  obtenerIconoTipo(tipo: string): string {
    return tipo === 'registro' ? 'assignment' : 'savings';
  }

  calcularProgresoMeta(): number {
    if (!this.fondo.metaAhorro || this.fondo.metaAhorro === 0) {
      return 0;
    }
    const progreso = (this.fondo.saldoActual / this.fondo.metaAhorro) * 100;
    return Math.min(Math.round(progreso), 100);
  }

  obtenerClaseProgreso(): string {
    const progreso = this.calcularProgresoMeta();
    if (progreso >= 80) return 'alto';
    if (progreso >= 50) return 'medio';
    return 'bajo';
  }

  obtenerIconoTransaccion(tipo: TipoTransaccion, categoria: string): string {
    if (tipo === 'ingreso') {
      const iconosIngresos: { [key: string]: string } = {
        'salario': 'attach_money',
        'freelance': 'work',
        'inversiones': 'trending_up',
        'regalos': 'card_giftcard'
      };
      return iconosIngresos[categoria] || 'add_circle';
    } else {
      const iconosGastos: { [key: string]: string } = {
        'alimentacion': 'restaurant',
        'transporte': 'directions_car',
        'entretenimiento': 'movie',
        'salud': 'local_hospital',
        'educacion': 'school',
        'hogar': 'home',
        'ropa': 'checkroom',
        'tecnologia': 'computer',
        'viajes': 'flight',
        'otros': 'category'
      };
      return iconosGastos[categoria] || 'remove_circle';
    }
  }

  formatearCategoria(categoria: string): string {
    const nombres: { [key: string]: string } = {
      'alimentacion': 'Alimentación',
      'transporte': 'Transporte',
      'entretenimiento': 'Entretenimiento',
      'salud': 'Salud',
      'educacion': 'Educación',
      'hogar': 'Hogar',
      'ropa': 'Ropa',
      'tecnologia': 'Tecnología',
      'viajes': 'Viajes',
      'otros': 'Otros',
      'salario': 'Salario',
      'freelance': 'Freelance',
      'inversiones': 'Inversiones',
      'regalos': 'Regalos'
    };
    return nombres[categoria] || categoria;
  }

  trackByTransaccion(index: number, transaccion: Transaccion): string {
    return transaccion._id || index.toString();
  }
}
