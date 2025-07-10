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

import { Fondo, PrestamoUtils } from '../../core/models/fondo.model';
import { Transaccion, TipoTransaccion } from '../../core/models/transaccion.model';
import { FondoService } from '../../core/services/fondo.service';
import { TransaccionService } from '../../core/services/transaccion.service';
import { NotificacionService } from '../services/notificacion.service';
import { CategoriaUtils } from '../utils/categoria.utils';

@Component({
  selector: 'app-prestamo-detalle-modal',
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
    <div class="prestamo-modal">
      <div class="modal-header">
        <div class="header-content">
          <div class="prestamo-icon">
            <mat-icon>account_balance</mat-icon>
          </div>
          <div class="header-info">
            <h2>{{ data.nombre }}</h2>
            <p class="tipo-fondo">💵 Fondo de Préstamos</p>
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
        <mat-tab-group animationDuration="0ms" class="prestamo-tabs">
          
          <!-- Tab 1: Resumen del Préstamo -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>analytics</mat-icon>
              <span>Resumen</span>
            </ng-template>
            
            <div class="tab-content">
              <!-- Estadísticas del Préstamo -->
              <div class="stats-grid">
                <div class="stat-item principal">
                  <div class="stat-label">Total Prestado</div>
                  <div class="stat-value total">
                    {{ data.metaAhorro | currency:'COP':'symbol':'1.0-0' }}
                  </div>
                </div>
                
                <div class="stat-item success">
                  <div class="stat-label">Ya Cobrado</div>
                  <div class="stat-value cobrado">
                    {{ progresoPrestamo.montoPagado | currency:'COP':'symbol':'1.0-0' }}
                  </div>
                </div>
                
                <div class="stat-item warning">
                  <div class="stat-label">Por Cobrar</div>
                  <div class="stat-value pendiente">
                    {{ progresoPrestamo.montoPendiente | currency:'COP':'symbol':'1.0-0' }}
                  </div>
                </div>
              </div>

              <!-- Progreso del Préstamo -->
              <mat-card class="progreso-card">
                <mat-card-header>
                  <mat-card-title>📊 Progreso de Cobro</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="progreso-section">
                    <div class="progreso-header">
                      <span>Cobrado</span>
                      <span class="progreso-porcentaje">{{ progresoPrestamo.porcentajePagado.toFixed(1) }}%</span>
                    </div>
                    <mat-progress-bar 
                      class="prestamo-progress" 
                      mode="determinate" 
                      [value]="progresoPrestamo.porcentajePagado"
                      color="primary">
                    </mat-progress-bar>
                  </div>
                  
                  <div class="progreso-status" *ngIf="progresoPrestamo.estaCompletado">
                    ✅ Préstamo completamente cobrado
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Información Básica -->
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title>ℹ️ Información del Préstamo</mat-card-title>
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
                        <small *ngIf="data.saldoActual < 0">Monto pendiente por cobrar</small>
                        <small *ngIf="data.saldoActual >= 0">Préstamo liquidado</small>
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
                    <button mat-raised-button color="primary" (click)="registrarCobro()">
                      <mat-icon>trending_up</mat-icon>
                      Registrar Cobro
                    </button>
                    
                    <button mat-raised-button color="accent" (click)="registrarNuevoPrestamo()">
                      <mat-icon>trending_down</mat-icon>
                      Nuevo Préstamo
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
                    <span class="stat-chip ingreso">{{ contarTransacciones('ingreso') }} cobros</span>
                    <span class="stat-chip gasto">{{ contarTransacciones('gasto') }} préstamos</span>
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
                          {{ transaccion.tipo === 'ingreso' ? '💰 Cobro' : '💸 Préstamo' }}
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
                        {{ transaccion.tipo === 'ingreso' ? 'Reduce deuda' : 'Aumenta monto' }}
                      </div>
                    </div>
                  </div>

                  <!-- Mensaje si no hay transacciones -->
                  <div class="sin-transacciones" *ngIf="transacciones.length === 0">
                    <mat-icon>account_balance</mat-icon>
                    <h4>Sin movimientos registrados</h4>
                    <p>Este préstamo aún no tiene transacciones.</p>
                    <button mat-raised-button color="primary" (click)="registrarCobro()">
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
    /* Override Angular Material modal padding */
    ::ng-deep .mat-mdc-dialog-container {
      padding: 0 !important;
    }
    
    ::ng-deep .mat-mdc-dialog-surface {
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
    }

    .prestamo-modal {
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

    .prestamo-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff9800, #f57c00);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .prestamo-icon mat-icon {
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
      color: #ff9800;
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
      border-color: #ff9800;
      background: rgba(255, 152, 0, 0.1);
    }

    .stat-item.success {
      border-color: #4caf50;
      background: rgba(76, 175, 80, 0.1);
    }

    .stat-item.warning {
      border-color: #f44336;
      background: rgba(244, 67, 54, 0.1);
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
      color: #ff9800;
    }

    .stat-value.cobrado {
      color: #4caf50;
    }

    .stat-value.pendiente {
      color: #f44336;
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
      color: #ff9800;
      font-weight: 600;
    }

    .prestamo-progress {
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

    .estado-item.activo {
      border-color: #ff9800;
      background: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    .estado-item.completado {
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
      color: #ff9800;
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
      .prestamo-modal {
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

    /* Nuevos estilos para transacciones */
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
      color: #ff9800;
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
      color: #ff9800;
    }

    .transacciones-count {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      background-color: rgba(255, 152, 0, 0.1);
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
      background-color: rgba(255, 152, 0, 0.05);
      border-left-color: #ff9800;
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
      background-color: rgba(255, 152, 0, 0.1);
      color: #ff9800;
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
      background-color: rgba(255, 152, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
      color: #ff9800;
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
      color: #ff9800;
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
      color: #ff9800;
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
      justify-content: space-between;
      align-items: center;
    }

    .actions-left {
      display: flex;
      align-items: center;
    }

    .total-transacciones {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      background-color: rgba(255, 152, 0, 0.1);
      padding: 4px 8px;
      border-radius: 12px;
    }

    .actions-right {
      display: flex;
      gap: 12px;
    }

    /* Estilos para los tabs */
    .prestamo-tabs {
      height: 100%;
    }

    .prestamo-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
      overflow: hidden;
    }

    .prestamo-tabs ::ng-deep .mat-mdc-tab-body-content {
      height: 100%;
      overflow-y: auto;
    }

    .tab-content {
      padding: 20px;
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Estado badge */
    .estado-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      margin-top: 8px;
    }

    .estado-activo {
      background-color: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    .estado-completado {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .estado-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* Transacciones header */
    .transacciones-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .transacciones-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #ff9800;
    }

    .transacciones-stats {
      display: flex;
      gap: 8px;
    }

    .stat-chip {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .stat-chip.ingreso {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .stat-chip.gasto {
      background-color: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    /* Mejoras en transacciones */
    .transaccion-titulo {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }

    .descripcion {
      font-weight: 500;
      font-size: 14px;
      flex: 1;
      margin-right: 8px;
    }

    .tipo-badge {
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge-ingreso {
      background-color: rgba(76, 175, 80, 0.15);
      color: #4caf50;
    }

    .badge-gasto {
      background-color: rgba(255, 152, 0, 0.15);
      color: #ff9800;
    }

    .separator {
      color: rgba(0,0,0,0.3);
      margin: 0 6px;
    }

    .monto-valor {
      font-weight: 600;
      font-size: 15px;
    }

    .monto-efecto {
      font-size: 10px;
      color: rgba(0,0,0,0.5);
      font-style: italic;
      margin-top: 2px;
    }

    .transacciones-container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* Progreso card */
    .progreso-card {
      margin-bottom: 16px;
    }

    .close-btn {
      color: rgba(0,0,0,0.5);
    }

    .close-btn:hover {
      color: rgba(0,0,0,0.8);
    }
  `]
})
export class PrestamoDetalleModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  transacciones: Transaccion[] = [];
  cargandoTransacciones = true;
  progresoPrestamo: any;

  constructor(
    private dialogRef: MatDialogRef<PrestamoDetalleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Fondo,
    private fondoService: FondoService,
    private transaccionService: TransaccionService,
    private notificationService: NotificacionService
  ) {
    this.progresoPrestamo = PrestamoUtils.calcularProgreso(data);
  }

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
          console.log('✅ Transacciones del préstamo cargadas:', transacciones);
          this.transacciones = transacciones;
          this.cargandoTransacciones = false;
        },
        error: (error) => {
          console.error('❌ Error cargando transacciones:', error);
          this.notificationService.mostrarError('Error al cargar las transacciones del préstamo');
          this.cargandoTransacciones = false;
        }
      });
  }

  getClaseEstado(): string {
    return this.progresoPrestamo.estaCompletado ? 'completado' : 'activo';
  }

  getIconoEstado(): string {
    return this.progresoPrestamo.estaCompletado ? 'check_circle' : 'schedule';
  }

  getTituloEstado(): string {
    if (this.progresoPrestamo.estaCompletado) {
      return 'Préstamo Completado';
    }
    return 'Préstamo Activo';
  }

  getDescripcionEstado(): string {
    if (this.progresoPrestamo.estaCompletado) {
      return 'El préstamo ha sido completamente cobrado';
    }
    return `Pendiente ${this.progresoPrestamo.montoPendiente.toLocaleString()} por cobrar`;
  }

  registrarCobro(): void {
    // Implementar lógica para registrar cobro
    console.log('Registrar cobro de préstamo');
    this.dialogRef.close({ action: 'cobro' });
  }

  registrarNuevoPrestamo(): void {
    // Implementar lógica para registrar nuevo préstamo
    console.log('Registrar nuevo préstamo');
    this.dialogRef.close({ action: 'nuevo_prestamo' });
  }

  obtenerIconoTransaccion(tipo: TipoTransaccion, categoria: string): string {
    if (tipo === 'ingreso') {
      return 'trending_up'; // Cobros
    } else {
      return 'trending_down'; // Nuevos préstamos
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
}
