import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
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
    MatProgressSpinnerModule,
    MatTabsModule,
    MatBadgeModule
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
            <div class="estado-badge" [class]="'estado-' + getClaseEstado()">
              <mat-icon>{{ getIconoEstado() }}</mat-icon>
              <span>{{ getTituloEstado() }}</span>
            </div>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="modal-content">
        <mat-tab-group animationDuration="0ms" class="deuda-tabs">
          
          <!-- Tab 1: Resumen de la Deuda -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>analytics</mat-icon>
              <span>Resumen</span>
            </ng-template>
            
            <div class="tab-content">
              <!-- Estadísticas de la Deuda -->
              <div class="stats-grid">
                <div class="stat-item principal">
                  <div class="stat-label">Total Deuda</div>
                  <div class="stat-value total">
                    {{ data.metaAhorro | currency:'COP':'symbol':'1.0-0' }}
                  </div>
                </div>
                
                <div class="stat-item success">
                  <div class="stat-label">Ya Pagado</div>
                  <div class="stat-value pagado">
                    {{ getProgresoDeuda().montoPagado | currency:'COP':'symbol':'1.0-0' }}
                  </div>
                </div>
                
                <div class="stat-item warning">
                  <div class="stat-label">Por Pagar</div>
                  <div class="stat-value pendiente">
                    {{ getProgresoDeuda().montoPendiente | currency:'COP':'symbol':'1.0-0' }}
                  </div>
                </div>
              </div>

              <!-- Progreso de la Deuda -->
              <mat-card class="progreso-card">
                <mat-card-header>
                  <mat-card-title>📊 Progreso de Pago</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="progreso-section">
                    <div class="progreso-header">
                      <span>Pagado</span>
                      <span class="progreso-porcentaje">{{ getProgresoDeuda().porcentajePagado.toFixed(1) }}%</span>
                    </div>
                    <mat-progress-bar 
                      class="deuda-progress" 
                      mode="determinate" 
                      [value]="getProgresoDeuda().porcentajePagado"
                      color="accent">
                    </mat-progress-bar>
                  </div>
                  
                  <div class="progreso-status" *ngIf="getProgresoDeuda().estaLiquidada">
                    ✅ Deuda completamente pagada
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Información Básica -->
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title>ℹ️ Información de la Deuda</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item" *ngIf="data.descripcion">
                      <mat-icon>description</mat-icon>
                      <div>
                        <strong>Descripción</strong>
                        <p>{{ data.descripcion }}</p>
                      </div>
                    </div>
                    
                    <div class="info-item">
                      <mat-icon>calendar_today</mat-icon>
                      <div>
                        <strong>Fecha de Creación</strong>
                        <p>{{ data.fechaCreacion | date:'dd/MM/yyyy' }}</p>
                      </div>
                    </div>
                    
                    <div class="info-item">
                      <mat-icon>account_balance_wallet</mat-icon>
                      <div>
                        <strong>Saldo Actual</strong>
                        <p>{{ data.saldoActual | currency:'COP':'symbol':'1.0-0' }}</p>
                        <small *ngIf="data.saldoActual < 0">Monto pendiente por pagar</small>
                        <small *ngIf="data.saldoActual >= 0">Deuda liquidada</small>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
              
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
          </mat-tab>

          <!-- Tab 2: Transacciones -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon [matBadge]="transacciones.length" 
                        matBadgeSize="small" 
                        [matBadgeHidden]="transacciones.length === 0">receipt_long</mat-icon>
              <span>Transacciones</span>
            </ng-template>
            
            <div class="tab-content">
              <!-- Loading de Transacciones -->
              <div class="loading-container" *ngIf="cargandoTransacciones">
                <mat-progress-spinner diameter="40" mode="indeterminate"></mat-progress-spinner>
                <p>Cargando transacciones...</p>
              </div>

              <!-- Lista de Transacciones -->
              <div class="transacciones-container" *ngIf="!cargandoTransacciones">
                <div class="transacciones-header">
                  <h3>📋 Historial de Movimientos</h3>
                  <div class="transacciones-stats">
                    <span class="stat-chip gasto">{{ contarTransacciones('gasto') }} pagos</span>
                    <span class="stat-chip ingreso">{{ contarTransacciones('ingreso') }} deudas</span>
                  </div>
                </div>

                <div class="transacciones-lista">
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
                      <div class="transaccion-titulo">
                        <span class="descripcion">{{ transaccion.descripcion }}</span>
                        <span class="tipo-badge" [class]="'badge-' + transaccion.tipo">
                          {{ transaccion.tipo === 'gasto' ? '💳 Pago' : '🔴 Deuda' }}
                        </span>
                      </div>
                      <div class="transaccion-detalles">
                        <span class="categoria">{{ formatearCategoria(transaccion.categoria) }}</span>
                        <span class="separator">•</span>
                        <span class="fecha">{{ transaccion.fecha | date:'dd/MM/yyyy' }}</span>
                      </div>
                      <div class="transaccion-notas" *ngIf="transaccion.notas">
                        💬 {{ transaccion.notas }}
                      </div>
                    </div>
                    
                    <div class="transaccion-monto" [class]="'monto-' + transaccion.tipo">
                      <div class="monto-valor">
                        <span class="signo">{{ transaccion.tipo === 'ingreso' ? '+' : '-' }}</span>
                        {{ transaccion.monto | currency:'COP':'symbol':'1.0-0' }}
                      </div>
                      <div class="monto-efecto">
                        {{ transaccion.tipo === 'gasto' ? 'Reduce deuda' : 'Aumenta deuda' }}
                      </div>
                    </div>
                  </div>

                  <!-- Mensaje si no hay transacciones -->
                  <div class="sin-transacciones" *ngIf="transacciones.length === 0">
                    <mat-icon>credit_card</mat-icon>
                    <h4>Sin movimientos registrados</h4>
                    <p>Esta deuda aún no tiene transacciones.</p>
                    <button mat-raised-button color="accent" (click)="registrarPago()">
                      <mat-icon>add</mat-icon>
                      Registrar Primera Transacción
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <div class="modal-actions">
        <div class="actions-left">
          <span class="total-transacciones">{{ transacciones.length }} transacciones</span>
        </div>
        <div class="actions-right">
          <button mat-button mat-dialog-close>
            <mat-icon>close</mat-icon>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-dialog-container { padding: 0 !important; }
    ::ng-deep .mat-mdc-dialog-surface { padding: 0 !important; margin: 0 !important; width: 100% !important; }
    
    .deuda-modal { width: 100%; max-width: 600px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; margin: 0; padding: 0; }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px 0; border-bottom: 1px solid rgba(0,0,0,0.1); margin-bottom: 20px; }
    .header-content { display: flex; align-items: center; gap: 16px; }
    .deuda-icon { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #f44336, #d32f2f); display: flex; align-items: center; justify-content: center; color: white; }
    .deuda-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .header-info h2 { margin: 0; font-size: 24px; font-weight: 600; }
    .tipo-fondo { margin: 4px 0 0; color: #f44336; font-weight: 500; }
    .modal-content { padding: 0 24px; display: flex; flex-direction: column; gap: 16px; flex: 1; overflow-y: auto; min-height: 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-item { text-align: center; padding: 16px; border-radius: 12px; border: 2px solid; }
    .stat-item.principal { border-color: #f44336; background: rgba(244, 67, 54, 0.1); }
    .stat-item.success { border-color: #4caf50; background: rgba(76, 175, 80, 0.1); }
    .stat-item.warning { border-color: #ff9800; background: rgba(255, 152, 0, 0.1); }
    .stat-label { font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #666; }
    .stat-value { font-size: 20px; font-weight: 700; }
    .stat-value.total { color: #f44336; }
    .stat-value.pagado { color: #4caf50; }
    .stat-value.pendiente { color: #ff9800; }
    .progreso-section { margin-top: 16px; }
    .progreso-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 500; }
    .progreso-porcentaje { color: #f44336; font-weight: 600; }
    .deuda-progress { height: 12px; border-radius: 6px; }
    .progreso-status { text-align: center; font-weight: 500; color: #4caf50; margin-top: 12px; padding: 8px; background: #e8f5e8; border-radius: 6px; }
    .info-grid { display: flex; flex-direction: column; gap: 16px; }
    .info-item { display: flex; align-items: flex-start; gap: 16px; }
    .info-item mat-icon { color: #f44336; margin-top: 2px; }
    .info-item strong { display: block; margin-bottom: 4px; }
    .info-item p { margin: 0; color: #666; }
    .info-item small { color: #999; font-style: italic; }
    .acciones-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .acciones-grid button { height: 48px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .modal-actions { padding: 16px 24px; border-top: 1px solid rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; background: white; }
    .actions-left { display: flex; align-items: center; }
    .total-transacciones { font-size: 12px; color: rgba(0,0,0,0.6); background-color: rgba(244, 67, 54, 0.1); padding: 4px 8px; border-radius: 12px; }
    .actions-right { display: flex; gap: 12px; }
    .deuda-tabs { height: 100%; }
    .deuda-tabs ::ng-deep .mat-mdc-tab-body-wrapper { flex: 1; overflow: hidden; }
    .deuda-tabs ::ng-deep .mat-mdc-tab-body-content { height: 100%; overflow-y: auto; }
    .tab-content { padding: 20px; height: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
    .estado-badge { display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; margin-top: 8px; }
    .estado-activa { background-color: rgba(244, 67, 54, 0.1); color: #f44336; }
    .estado-liquidada { background-color: rgba(76, 175, 80, 0.1); color: #4caf50; }
    .estado-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .transacciones-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(0,0,0,0.1); }
    .transacciones-header h3 { margin: 0; font-size: 18px; font-weight: 600; color: #f44336; }
    .transacciones-stats { display: flex; gap: 8px; }
    .stat-chip { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .stat-chip.ingreso { background-color: rgba(244, 67, 54, 0.1); color: #f44336; }
    .stat-chip.gasto { background-color: rgba(76, 175, 80, 0.1); color: #4caf50; }
    .loading-container { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px; color: rgba(0,0,0,0.6); }
    .transacciones-lista { display: flex; flex-direction: column; gap: 12px; }
    .transaccion-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; border-left: 4px solid; transition: all 0.2s ease; }
    .transaccion-item:hover { background-color: rgba(0,0,0,0.02); transform: translateX(2px); }
    .transaccion-ingreso { background-color: rgba(244, 67, 54, 0.05); border-left-color: #f44336; }
    .transaccion-gasto { background-color: rgba(76, 175, 80, 0.05); border-left-color: #4caf50; }
    .transaccion-icon { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
    .icon-ingreso { background-color: rgba(244, 67, 54, 0.1); color: #f44336; }
    .icon-gasto { background-color: rgba(76, 175, 80, 0.1); color: #4caf50; }
    .transaccion-info { flex: 1; min-width: 0; }
    .transaccion-titulo { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
    .descripcion { font-weight: 500; font-size: 14px; flex: 1; margin-right: 8px; }
    .tipo-badge { padding: 2px 6px; border-radius: 8px; font-size: 10px; font-weight: 600; white-space: nowrap; }
    .badge-ingreso { background-color: rgba(244, 67, 54, 0.15); color: #f44336; }
    .badge-gasto { background-color: rgba(76, 175, 80, 0.15); color: #4caf50; }
    .transaccion-detalles { display: flex; gap: 12px; font-size: 12px; color: rgba(0,0,0,0.6); }
    .categoria { background-color: rgba(244, 67, 54, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 500; color: #f44336; }
    .separator { color: rgba(0,0,0,0.3); margin: 0 6px; }
    .transaccion-notas { font-size: 11px; color: rgba(0,0,0,0.5); font-style: italic; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .transaccion-monto { font-weight: 600; font-size: 14px; text-align: right; flex-shrink: 0; }
    .monto-valor { font-weight: 600; font-size: 15px; }
    .monto-efecto { font-size: 10px; color: rgba(0,0,0,0.5); font-style: italic; margin-top: 2px; }
    .monto-ingreso { color: #f44336; }
    .monto-gasto { color: #4caf50; }
    .signo { font-weight: 700; }
    .sin-transacciones { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px; text-align: center; color: rgba(0,0,0,0.5); }
    .sin-transacciones mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; color: #f44336; }
    .sin-transacciones h4 { margin: 0; font-weight: 500; }
    .sin-transacciones p { margin: 0; font-size: 14px; }
    .transacciones-container { flex: 1; display: flex; flex-direction: column; }
    .progreso-card { margin-bottom: 16px; }
    .close-btn { color: rgba(0,0,0,0.5); }
    .close-btn:hover { color: rgba(0,0,0,0.8); }
    
    @media (max-width: 768px) {
      .deuda-modal { max-width: 100%; height: 100vh; max-height: 100vh; }
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
    console.log('Registrar pago de deuda');
    this.dialogRef.close({ action: 'pago' });
  }

  registrarNuevaDeuda(): void {
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

  contarTransacciones(tipo: TipoTransaccion): number {
    return this.transacciones.filter(t => t.tipo === tipo).length;
  }

  getClaseEstado(): string {
    return this.getProgresoDeuda().estaLiquidada ? 'liquidada' : 'activa';
  }

  getIconoEstado(): string {
    return this.getProgresoDeuda().estaLiquidada ? 'check_circle' : 'schedule';
  }

  getTituloEstado(): string {
    if (this.getProgresoDeuda().estaLiquidada) {
      return 'Deuda Liquidada';
    }
    return 'Deuda Activa';
  }

  getProgresoDeuda(): {
    porcentajePagado: number;
    montoPagado: number;
    montoPendiente: number;
    estaLiquidada: boolean;
  } {
    if (this.data.tipo !== 'deuda') {
      return { porcentajePagado: 0, montoPagado: 0, montoPendiente: 0, estaLiquidada: false };
    }

    const montoPagado = this.data.metaAhorro + this.data.saldoActual;
    const montoPendiente = Math.abs(this.data.saldoActual);
    const porcentajePagado = (montoPagado / this.data.metaAhorro) * 100;
    const estaLiquidada = this.data.saldoActual >= 0;

    return {
      porcentajePagado: Math.max(0, Math.min(100, porcentajePagado)),
      montoPagado: Math.max(0, montoPagado),
      montoPendiente,
      estaLiquidada
    };
  }
}