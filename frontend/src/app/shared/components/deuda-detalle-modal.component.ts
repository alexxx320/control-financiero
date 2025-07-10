import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Fondo } from '../../core/models/fondo.model';
import { Transaccion, TipoTransaccion } from '../../core/models/transaccion.model';
import { FondoService } from '../../core/services/fondo.service';
import { TransaccionService } from '../../core/services/transaccion.service';
import { NotificacionService } from '../services/notificacion.service';
import { CategoriaUtils } from '../utils/categoria.utils';

@Component({
  selector: 'app-deuda-detalle-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="deuda-modal">
      <div class="modal-header">
        <div class="header-content">
          <div class="deuda-icon">
            <mat-icon>credit_card</mat-icon>
          </div>
          <div class="header-info">
            <h2>{{ data.nombre }}</h2>
            <p class="tipo-fondo">🔴 Fondo de Deudas</p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="modal-content">
        <!-- Información Básica de la Deuda -->
        <mat-card class="info-card-basic">
          <mat-card-content>
            <div class="info-row">
              <div class="info-item" *ngIf="data.descripcion">
                <mat-icon>description</mat-icon>
                <span>{{ data.descripcion }}</span>
              </div>
              <div class="info-item">
                <mat-icon>calendar_today</mat-icon>
                <span>Creado: {{ data.fechaCreacion | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Sección de Transacciones de la Deuda -->
        <div class="transacciones-section">
          <div class="section-header">
            <h3>
              <mat-icon>receipt_long</mat-icon>
              Historial de Transacciones
            </h3>
            <div class="transacciones-count" *ngIf="!cargandoTransacciones">
              {{ transacciones.length }} transacciones
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
              <mat-icon>credit_card</mat-icon>
              <h4>Sin movimientos</h4>
              <p>Esta deuda aún no tiene transacciones registradas.</p>
            </div>
          </div>
        </div>

        <!-- Acciones Rápidas -->
        <mat-card class="acciones-card">
          <mat-card-header>
            <mat-card-title>⚡ Acciones Rápidas</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="acciones-grid">
              <button mat-raised-button color="accent" (click)="registrarPago()">
                <mat-icon>trending_down</mat-icon>
                Registrar Pago
              </button>
              
              <button mat-raised-button color="warn" (click)="registrarNuevaDeuda()">
                <mat-icon>trending_up</mat-icon>
                Nueva Deuda
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="modal-actions">
        <button mat-button mat-dialog-close>
          <mat-icon>close</mat-icon>
          Cerrar
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Override Angular Material modal padding */
    ::ng-deep .mat-mdc-dialog-container {
      padding: 0 !important;
    }
    
    ::ng-deep .mat-mdc-dialog-surface {
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
    }

    .deuda-modal {
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 24px 0;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .deuda-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f44336, #d32f2f);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .deuda-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-info h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .tipo-fondo {
      margin: 4px 0 0;
      color: #f44336;
      font-weight: 500;
    }

    .modal-content {
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      border-radius: 12px;
      border: 2px solid;
    }

    .stat-item.principal {
      border-color: #f44336;
      background: rgba(244, 67, 54, 0.1);
    }

    .stat-item.success {
      border-color: #4caf50;
      background: rgba(76, 175, 80, 0.1);
    }

    .stat-item.warning {
      border-color: #ff9800;
      background: rgba(255, 152, 0, 0.1);
    }

    .stat-label {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #666;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
    }

    .stat-value.total {
      color: #f44336;
    }

    .stat-value.pagado {
      color: #4caf50;
    }

    .stat-value.pendiente {
      color: #ff9800;
    }

    .progreso-section {
      margin-top: 16px;
    }

    .progreso-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .progreso-porcentaje {
      color: #f44336;
      font-weight: 600;
    }

    .deuda-progress {
      height: 12px;
      border-radius: 6px;
    }

    .progreso-status {
      text-align: center;
      font-weight: 500;
      color: #4caf50;
      margin-top: 12px;
      padding: 8px;
      background: #e8f5e8;
      border-radius: 6px;
    }

    .estado-info {
      display: flex;
      justify-content: center;
    }

    .estado-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
      border: 2px solid;
      min-width: 280px;
    }

    .estado-item.activa {
      border-color: #f44336;
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .estado-item.liquidada {
      border-color: #4caf50;
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .estado-texto h4 {
      margin: 0;
      font-size: 16px;
    }

    .estado-texto p {
      margin: 4px 0 0;
      font-size: 14px;
      opacity: 0.8;
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .info-item mat-icon {
      color: #f44336;
      margin-top: 2px;
    }

    .info-item strong {
      display: block;
      margin-bottom: 4px;
    }

    .info-item p {
      margin: 0;
      color: #666;
    }

    .info-item small {
      color: #999;
      font-style: italic;
    }

    .acciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .acciones-grid button {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .modal-actions {
      padding: 16px 24px;
      border-top: 1px solid rgba(0,0,0,0.1);
      display: flex;
      justify-content: flex-end;
      flex-shrink: 0;
      background: white;
    }

    @media (max-width: 768px) {
      .deuda-modal {
        max-width: 100%;
        height: 100vh;
        max-height: 100vh;
      }

      .info-row {
        flex-direction: column;
        align-items: flex-start;
      }

      .acciones-grid {
        grid-template-columns: 1fr;
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

    /* Estilos para transacciones */
    .info-card-basic {
      margin: 16px 24px;
    }

    .info-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: rgba(0,0,0,0.7);
    }

    .info-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #f44336;
    }

    .info-item span {
      font-weight: 500;
    }

    .transacciones-section {
      padding: 16px 24px;
      margin: 0;
      width: 100%;
      box-sizing: border-box;
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
      color: #f44336;
    }

    .transacciones-count {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      background-color: rgba(244, 67, 54, 0.1);
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
      background-color: rgba(244, 67, 54, 0.05);
      border-left-color: #f44336;
    }

    .transaccion-gasto {
      background-color: rgba(76, 175, 80, 0.05);
      border-left-color: #4caf50;
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
      background-color: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .icon-gasto {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
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
      background-color: rgba(244, 67, 54, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
      color: #f44336;
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
      color: #f44336;
    }

    .monto-gasto {
      color: #4caf50;
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
      color: #f44336;
    }

    .sin-transacciones h4 {
      margin: 0;
      font-weight: 500;
    }

    .sin-transacciones p {
      margin: 0;
      font-size: 14px;
    }

    .acciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .acciones-grid button {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .modal-actions {
      padding: 16px 24px;
      border-top: 1px solid rgba(0,0,0,0.1);
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class DeudaDetalleModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  transacciones: Transaccion[] = [];
  cargandoTransacciones = true;

  constructor(
    private dialogRef: MatDialogRef<DeudaDetalleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Fondo,
    private fondoService: FondoService,
    private transaccionService: TransaccionService,
    private notificationService: NotificacionService
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
    
    this.transaccionService.obtenerTransaccionesPorFondo(this.data._id!, 50)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transacciones: Transaccion[]) => {
          console.log('✅ Transacciones de la deuda cargadas:', transacciones);
          this.transacciones = transacciones;
          this.cargandoTransacciones = false;
        },
        error: (error) => {
          console.error('❌ Error cargando transacciones:', error);
          this.notificationService.mostrarError('Error al cargar las transacciones de la deuda');
          this.cargandoTransacciones = false;
        }
      });
  }

  registrarPago(): void {
    // Implementar lógica para registrar pago de deuda
    console.log('Registrar pago de deuda');
    this.dialogRef.close({ action: 'pago' });
  }

  registrarNuevaDeuda(): void {
    // Implementar lógica para registrar nueva deuda
    console.log('Registrar nueva deuda');
    this.dialogRef.close({ action: 'nueva_deuda' });
  }

  obtenerIconoTransaccion(tipo: TipoTransaccion, categoria: string): string {
    if (tipo === 'gasto') {
      return 'trending_down'; // Pagos de deuda
    } else {
      return 'trending_up'; // Nuevas deudas
    }
  }

  formatearCategoria(categoria: string): string {
    return CategoriaUtils.formatearCategoria(categoria);
  }

  trackByTransaccion(index: number, transaccion: Transaccion): string {
    return transaccion._id || index.toString();
  }
}
