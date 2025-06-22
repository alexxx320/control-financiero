import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ReportesService, ReporteMensual, ReporteAnual, Alerta, EstadisticasGenerales } from '../../core/services/reportes.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatChipsModule,
    MatGridListModule,
    MatProgressBarModule,
    MatMenuModule
  ],
  template: `
    <div class="reportes-container">
      <!-- Header con título y controles -->
      <div class="header-section">
        <div class="title-section">
          <h1><mat-icon>assessment</mat-icon> Reportes Financieros</h1>
          <p>Panel completo de análisis y reportes financieros</p>
        </div>
        
        <div class="controls-section">
          <form [formGroup]="filtrosForm" class="filtros-form">
            <mat-form-field appearance="outline">
              <mat-label>Período</mat-label>
              <mat-select formControlName="periodo">
                <mat-option value="semana">Esta Semana</mat-option>
                <mat-option value="mes">Este Mes</mat-option>
                <mat-option value="trimestre">Este Trimestre</mat-option>
                <mat-option value="año">Este Año</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button [matMenuTriggerFor]="exportMenu" [disabled]="cargando">
              <mat-icon>download</mat-icon>
              Exportar
            </button>
            
            <mat-menu #exportMenu="matMenu">
              <button mat-menu-item (click)="exportarPDF()">
                <mat-icon>picture_as_pdf</mat-icon>
                <span>Exportar PDF</span>
              </button>
              <button mat-menu-item (click)="exportarExcel()">
                <mat-icon>table_chart</mat-icon>
                <span>Exportar Excel</span>
              </button>
            </mat-menu>
          </form>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-container">
        <mat-spinner [diameter]="50"></mat-spinner>
        <p>Generando reportes financieros...</p>
      </div>

      <!-- Contenido principal -->
      <div *ngIf="!cargando" class="main-content">
        
        <!-- KPIs principales -->
        <mat-card class="kpis-card" *ngIf="dashboardData">
          <mat-card-header>
            <mat-card-title>
              <div class="kpi-header">
                <span>Indicadores Clave - {{ dashboardData.periodo || dashboardData.reporteMensual?.periodo }}</span>
                <mat-chip class="periodo-chip">{{ filtrosForm.get('periodo')?.value | titlecase }}</mat-chip>
              </div>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="kpis-grid">
              <div class="kpi-item ingresos">
                <div class="kpi-icon">
                  <mat-icon>trending_up</mat-icon>
                </div>
                <div class="kpi-content">
                  <span class="kpi-label">Total Ingresos</span>
                  <span class="kpi-value">{{ dashboardData.kpis.totalIngresos | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
              </div>
              
              <div class="kpi-item gastos">
                <div class="kpi-icon">
                  <mat-icon>trending_down</mat-icon>
                </div>
                <div class="kpi-content">
                  <span class="kpi-label">Total Gastos</span>
                  <span class="kpi-value">{{ dashboardData.kpis.totalGastos | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
              </div>
              
              <div class="kpi-item utilidad" [ngClass]="{'positivo': dashboardData.kpis.utilidadNeta >= 0, 'negativo': dashboardData.kpis.utilidadNeta < 0}">
                <div class="kpi-icon">
                  <mat-icon>{{ dashboardData.kpis.utilidadNeta >= 0 ? 'show_chart' : 'money_off' }}</mat-icon>
                </div>
                <div class="kpi-content">
                  <span class="kpi-label">Utilidad Neta</span>
                  <span class="kpi-value">{{ dashboardData.kpis.utilidadNeta | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
              </div>
              
              <div class="kpi-item margen">
                <div class="kpi-icon">
                  <mat-icon>percent</mat-icon>
                </div>
                <div class="kpi-content">
                  <span class="kpi-label">Margen Utilidad</span>
                  <span class="kpi-value">{{ dashboardData.kpis.margenUtilidad | number:'1.1-1' }}%</span>
                </div>
              </div>
              
              <!-- 🆕 NUEVO KPI: Patrimonio Total (al final) -->
              <div class="kpi-item patrimonio" [ngClass]="{'positivo': dashboardData.kpis.sumaTotalFondos >= 0, 'negativo': dashboardData.kpis.sumaTotalFondos < 0}">
                <div class="kpi-icon">
                  <mat-icon>account_balance_wallet</mat-icon>
                </div>
                <div class="kpi-content">
                  <span class="kpi-label">Patrimonio Total</span>
                  <span class="kpi-value">{{ dashboardData.kpis.sumaTotalFondos | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Detalle de reportes por tabla -->
        <mat-card class="tabla-reportes-card" *ngIf="dashboardData?.reporteMensual">
          <mat-card-header>
            <mat-card-title>
              Detalle de Fondos
              <span class="tabla-subtitle">({{ dashboardData.reporteMensual.resumen.transaccionesTotales }} transacciones)</span>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="tabla-container">
              <table mat-table [dataSource]="dataSourceFondos" class="fondos-table">
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Fondo</th>
                  <td mat-cell *matCellDef="let fondo">{{ fondo.nombre }}</td>
                </ng-container>

                <ng-container matColumnDef="balanceInicial">
                  <th mat-header-cell *matHeaderCellDef>Balance Inicial</th>
                  <td mat-cell *matCellDef="let fondo">{{ fondo.balanceInicial | currency:'COP':'symbol':'1.0-0' }}</td>
                </ng-container>

                <ng-container matColumnDef="ingresos">
                  <th mat-header-cell *matHeaderCellDef>Ingresos</th>
                  <td mat-cell *matCellDef="let fondo" class="ingresos">{{ fondo.ingresos | currency:'COP':'symbol':'1.0-0' }}</td>
                </ng-container>

                <ng-container matColumnDef="gastos">
                  <th mat-header-cell *matHeaderCellDef>Gastos</th>
                  <td mat-cell *matCellDef="let fondo" class="gastos">{{ fondo.gastos | currency:'COP':'symbol':'1.0-0' }}</td>
                </ng-container>

                <ng-container matColumnDef="balanceFinal">
                  <th mat-header-cell *matHeaderCellDef>Balance Final</th>
                  <td mat-cell *matCellDef="let fondo" [ngClass]="{'positivo': fondo.balanceFinal >= 0, 'negativo': fondo.balanceFinal < 0}">
                    {{ fondo.balanceFinal | currency:'COP':'symbol':'1.0-0' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="transacciones">
                  <th mat-header-cell *matHeaderCellDef>Transacciones</th>
                  <td mat-cell *matCellDef="let fondo">{{ fondo.transacciones }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumnsFondos"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumnsFondos;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Alertas importantes -->
        <mat-card class="alertas-card" *ngIf="dashboardData?.alertas && dashboardData.alertas.length > 0">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="alerta-icon">notifications_active</mat-icon>
              Alertas Activas ({{ dashboardData.alertas.length }})
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="alertas-lista">
              <div *ngFor="let alerta of dashboardData.alertas" class="alerta-item" [ngClass]="'alerta-' + alerta.tipo.toLowerCase()">
                <mat-icon [style.color]="getColorAlerta(alerta.tipo)">{{ getIconoAlerta(alerta.tipo) }}</mat-icon>
                <div class="alerta-content">
                  <strong>{{ alerta.fondo }}</strong>
                  <span>{{ alerta.mensaje }}</span>
                </div>
                <mat-chip [style.background-color]="getColorAlerta(alerta.tipo)" 
                         [style.color]="'white'" 
                         class="prioridad-chip">
                  {{ alerta.prioridad }}
                </mat-chip>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Historial de Transacciones -->
        <mat-card class="historial-card" *ngIf="dashboardData?.historialTransacciones && dashboardData.historialTransacciones.length > 0">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>history</mat-icon>
              Historial de Transacciones
              <span class="historial-subtitle">({{ dashboardData.historialTransacciones.length }} últimas)</span>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="historial-container">
              <table mat-table [dataSource]="dataSourceHistorial" class="historial-table">
                <ng-container matColumnDef="fecha">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let transaccion">{{ transaccion.fecha | date:'dd/MM/yyyy' }}</td>
                </ng-container>

                <ng-container matColumnDef="descripcion">
                  <th mat-header-cell *matHeaderCellDef>Descripción</th>
                  <td mat-cell *matCellDef="let transaccion">
                    <div class="transaccion-descripcion">
                      <span class="descripcion-principal">{{ transaccion.descripcion }}</span>
                      <span class="fondo-nombre" *ngIf="transaccion.fondo">{{ transaccion.fondo }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="categoria">
                  <th mat-header-cell *matHeaderCellDef>Categoría</th>
                  <td mat-cell *matCellDef="let transaccion">
                    <mat-chip class="categoria-chip">{{ transaccion.categoria }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="tipo">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let transaccion">
                    <mat-chip [ngClass]="{
                      'tipo-ingreso': transaccion.tipo === 'ingreso',
                      'tipo-gasto': transaccion.tipo === 'gasto'
                    }">
                      <mat-icon>{{ transaccion.tipo === 'ingreso' ? 'add' : 'remove' }}</mat-icon>
                      {{ transaccion.tipo | titlecase }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="monto">
                  <th mat-header-cell *matHeaderCellDef>Monto</th>
                  <td mat-cell *matCellDef="let transaccion" [ngClass]="{
                    'monto-ingreso': transaccion.tipo === 'ingreso',
                    'monto-gasto': transaccion.tipo === 'gasto'
                  }">
                    {{ transaccion.tipo === 'ingreso' ? '+' : '-' }}{{ transaccion.monto | currency:'COP':'symbol':'1.0-0' }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumnsHistorial"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumnsHistorial;"></tr>
              </table>

              <div class="historial-footer" *ngIf="dashboardData.historialTransacciones.length >= 50">
                <p class="footer-text">
                  <mat-icon>info</mat-icon>
                  Mostrando las últimas 50 transacciones del período seleccionado.
                </p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Mensaje informativo si no hay datos -->
        <mat-card class="info-card" *ngIf="!dashboardData">
          <mat-card-content>
            <div class="info-content">
              <mat-icon class="info-icon">info</mat-icon>
              <div>
                <h3>No hay datos para mostrar</h3>
                <p>No se encontraron datos financieros para el período seleccionado.</p>
                <div class="info-steps">
                  <h4>Para comenzar a ver reportes:</h4>
                  <ol>
                    <li><strong>Crea al menos un fondo</strong> en la sección "Fondos"</li>
                    <li><strong>Registra transacciones</strong> (ingresos o gastos) en tus fondos</li>
                    <li><strong>Regresa aquí</strong> para ver tus reportes financieros</li>
                  </ol>
                </div>
                <div class="info-actions">
                  <button mat-stroked-button color="accent" [routerLink]="['/fondos']">
                    <mat-icon>account_balance</mat-icon>
                    Ir a Fondos
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- Mensaje cuando hay fondos pero no transacciones -->
        <mat-card class="warning-card" *ngIf="dashboardData && dashboardData.reporteMensual && dashboardData.reporteMensual.resumen.transaccionesTotales === 0">
          <mat-card-content>
            <div class="warning-content">
              <mat-icon class="warning-icon">warning</mat-icon>
              <div>
                <h3>Sin transacciones en {{ dashboardData.reporteMensual.periodo }}</h3>
                <p>Tienes fondos activos, pero no hay transacciones registradas en el período seleccionado. Puedes registrar una nueva transacción o seleccionar un período diferente en el filtro de arriba.</p>
                <div class="warning-actions">
                  <button mat-raised-button color="primary" [routerLink]="['/transacciones']">
                    <mat-icon>add</mat-icon>
                    Registrar transacción
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .reportes-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .title-section h1 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1976d2;
      font-size: 2rem;
    }

    .title-section p {
      margin: 8px 0 0 0;
      color: #666;
      font-size: 1rem;
    }

    .filtros-form {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .filtros-form mat-form-field {
      min-width: 180px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      background: white;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* KPIs Grid */
    .kpis-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px;
      overflow: hidden;
    }

    .kpis-card mat-card-header {
      background: rgba(255,255,255,0.1);
      padding: 16px 24px;
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .periodo-chip {
      background-color: rgba(255,255,255,0.2);
      color: white;
      font-weight: 600;
      font-size: 0.8rem;
    }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 24px;
      max-width: 1200px; /* Expandido para 5 KPIs */
      margin: 0 auto;
    }

    .kpi-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(255,255,255,0.1);
      padding: 20px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      transition: transform 0.2s ease;
    }

    .kpi-item:hover {
      transform: translateY(-4px);
      background: rgba(255,255,255,0.15);
    }

    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.2);
    }

    .kpi-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .kpi-content {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .kpi-label {
      font-size: 0.9rem;
      opacity: 0.9;
      margin-bottom: 4px;
    }

    .kpi-value {
      font-size: 1.4rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .kpi-item.patrimonio {
      background: rgba(255,255,255,0.15);
      border-left: 3px solid rgba(255,215,0,0.8); /* Dorado para patrimonio */
    }

    .kpi-item.patrimonio:hover {
      background: rgba(255,215,0,0.1);
      transform: translateY(-4px);
    }

    .kpi-item.patrimonio .kpi-icon {
      background: rgba(255,215,0,0.2);
    }

    .kpi-item.patrimonio .kpi-icon mat-icon {
      color: #ffd700; /* Dorado */
    }

    /* Alertas */
    .alertas-card {
      border-left: 4px solid #ff9800;
    }

    .alerta-icon {
      color: #ff9800;
      margin-right: 8px;
    }

    .alertas-lista {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alerta-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      background-color: rgba(0,0,0,0.02);
      border: 1px solid rgba(0,0,0,0.05);
    }

    .alerta-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .alerta-content strong {
      font-weight: 600;
      color: #333;
    }

    .alerta-content span {
      color: #666;
      font-size: 0.9rem;
    }

    .prioridad-chip {
      font-size: 0.8rem;
      font-weight: 500;
    }

    /* Tabla */
    .tabla-container {
      overflow-x: auto;
    }

    .fondos-table {
      width: 100%;
    }

    .fondos-table .ingresos {
      color: #4caf50;
      font-weight: 500;
    }

    .fondos-table .gastos {
      color: #f44336;
      font-weight: 500;
    }

    .fondos-table .positivo {
      color: #4caf50;
      font-weight: 600;
    }

    .fondos-table .negativo {
      color: #f44336;
      font-weight: 600;
    }

    .tabla-subtitle {
      font-size: 0.9rem;
      font-weight: 400;
      color: #666;
      margin-left: 8px;
    }

    /* Historial de Transacciones */
    .historial-card {
      border-left: 4px solid #2196f3;
    }

    .historial-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .historial-subtitle {
      font-size: 0.9rem;
      font-weight: 400;
      color: #666;
      margin-left: 8px;
    }

    .historial-container {
      overflow-x: auto;
    }

    .historial-table {
      width: 100%;
    }

    .transaccion-descripcion {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .descripcion-principal {
      font-weight: 500;
      color: #333;
    }

    .fondo-nombre {
      font-size: 0.8rem;
      color: #666;
      font-style: italic;
    }

    .categoria-chip {
      background-color: #e0e0e0;
      color: #333;
      font-size: 0.8rem;
    }

    .tipo-ingreso {
      background-color: #4caf50;
      color: white;
    }

    .tipo-gasto {
      background-color: #f44336;
      color: white;
    }

    .tipo-ingreso mat-icon,
    .tipo-gasto mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .monto-ingreso {
      color: #4caf50;
      font-weight: 600;
    }

    .monto-gasto {
      color: #f44336;
      font-weight: 600;
    }

    .historial-footer {
      margin-top: 16px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 8px;
      border-left: 3px solid #2196f3;
    }

    .footer-text {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9rem;
    }

    .footer-text mat-icon {
      color: #2196f3;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Info Card */
    .info-card {
      border-left: 4px solid #2196f3;
    }

    .info-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .info-icon {
      color: #2196f3;
      font-size: 32px;
      width: 32px;
      height: 32px;
      margin-top: 4px;
    }

    .info-content h3 {
      margin: 0 0 8px 0;
      color: #2196f3;
    }

    .info-content p {
      margin: 0 0 12px 0;
    }

    .info-steps {
      margin: 16px 0;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 3px solid #2196f3;
    }

    .info-steps h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 1.1rem;
    }

    .info-steps ol {
      margin: 0;
      padding-left: 20px;
    }

    .info-steps li {
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .info-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Warning Card */
    .warning-card {
      border-left: 4px solid #ff9800;
      background: linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%);
    }

    .warning-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .warning-icon {
      color: #ff9800;
      font-size: 32px;
      width: 32px;
      height: 32px;
      margin-top: 4px;
    }

    .warning-content h3 {
      margin: 0 0 8px 0;
      color: #ff9800;
    }

    .warning-content p {
      margin: 0 0 16px 0;
      color: #666;
    }

    .warning-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .reportes-container {
        padding: 16px;
      }

      .header-section {
        flex-direction: column;
        gap: 16px;
      }

      .filtros-form {
        flex-direction: column;
        align-items: stretch;
      }

      .filtros-form mat-form-field {
        min-width: auto;
      }

      .kpis-grid {
        grid-template-columns: 1fr;
        padding: 16px;
      }

      .charts-section {
        grid-template-columns: 1fr;
      }

      .info-content,
      .warning-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .info-actions,
      .warning-actions {
        justify-content: center;
      }

      .info-steps {
        text-align: left;
        width: 100%;
      }
    }
  `]
})
export class ReportesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  filtrosForm: FormGroup;
  cargando = false;
  
  // Datos del dashboard
  dashboardData: any = null;

  // Configuración de tablas
  dataSourceFondos = new MatTableDataSource<any>();
  dataSourceHistorial = new MatTableDataSource<any>();
  displayedColumnsFondos: string[] = ['nombre', 'balanceInicial', 'ingresos', 'gastos', 'balanceFinal', 'transacciones'];
  displayedColumnsHistorial: string[] = ['fecha', 'descripcion', 'categoria', 'tipo', 'monto'];

  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesService,
    private notificationService: NotificationService
  ) {
    this.filtrosForm = this.fb.group({
      periodo: ['mes']
    });
    
    // Escuchar cambios en el formulario para recargar automáticamente
    this.filtrosForm.get('periodo')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((nuevoPeriodo: string) => {
        console.log(`🔄 Período cambiado a: ${nuevoPeriodo}`);
        // Dar un pequeño delay para que se actualice la UI antes de cargar
        setTimeout(() => {
          this.cargarDashboard();
        }, 100);
      });
  }

  ngOnInit(): void {
    console.log('🚀 Iniciando componente de reportes financieros...');
    this.cargarDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDashboard(): void {
    const periodo = this.filtrosForm.get('periodo')?.value;
    console.log(`📊 Cargando dashboard para período: ${periodo}`);
    
    this.cargando = true;
    this.dashboardData = null; // Limpiar datos anteriores
    
    this.reportesService.obtenerDashboard(periodo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('📊 Datos recibidos del dashboard:', data);
          
          // Verificar si hay datos válidos
          if (data && data.reporteMensual) {
            this.dashboardData = data;
            
            // Configurar datos de la tabla
            if (data.reporteMensual?.fondos && Array.isArray(data.reporteMensual.fondos)) {
              this.dataSourceFondos.data = data.reporteMensual.fondos;
              console.log(`📋 Tabla configurada con ${data.reporteMensual.fondos.length} fondos`);
            } else {
              this.dataSourceFondos.data = [];
              console.log('📋 No hay fondos para mostrar en la tabla');
            }
            
            // Configurar datos del historial
            if (data.historialTransacciones && Array.isArray(data.historialTransacciones)) {
              this.dataSourceHistorial.data = data.historialTransacciones;
              console.log(`📈 Historial configurado con ${data.historialTransacciones.length} transacciones`);
            } else {
              this.dataSourceHistorial.data = [];
              console.log('📈 No hay transacciones para mostrar en el historial');
            }
            
            console.log('✅ Dashboard cargado exitosamente:', this.dashboardData);
            
            // Mostrar mensaje según el estado de los datos
            if (data.reporteMensual.resumen.transaccionesTotales === 0) {
              this.notificationService.info('Dashboard cargado - No hay transacciones en el período seleccionado');
            } else {
              this.notificationService.success(`Dashboard actualizado - ${data.reporteMensual.resumen.transaccionesTotales} transacciones encontradas`);
            }
          } else {
            console.warn('⚠️ No se recibieron datos válidos del dashboard');
            this.dashboardData = null;
            this.dataSourceFondos.data = [];
            this.notificationService.warning('No hay datos disponibles para mostrar');
          }
          
          this.cargando = false;
        },
        error: (error: any) => {
          console.error('❌ Error al cargar dashboard:', error);
          console.error('❌ Error details:', error.error);
          this.cargando = false;
          this.dashboardData = null;
          this.dataSourceFondos.data = [];
          this.dataSourceHistorial.data = [];
          
          let errorMessage = 'Error al cargar los reportes financieros';
          if (error.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor. Inténtalo más tarde';
          }
          
          this.notificationService.error(errorMessage);
        }
      });
  }

  exportarPDF(): void {
    console.log('📄 Exportando reporte a PDF...');
    this.reportesService.exportarPDF({ periodo: this.filtrosForm.get('periodo')?.value })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.notificationService.success('Reporte PDF descargado exitosamente');
        },
        error: (error: any) => {
          console.error('❌ Error al exportar PDF:', error);
          this.notificationService.error('Error al generar el PDF');
        }
      });
  }

  exportarExcel(): void {
    console.log('📊 Exportando reporte a Excel...');
    this.reportesService.exportarExcel({ periodo: this.filtrosForm.get('periodo')?.value })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.notificationService.success('Reporte Excel descargado exitosamente');
        },
        error: (error: any) => {
          console.error('❌ Error al exportar Excel:', error);
          this.notificationService.error('Error al generar el Excel');
        }
      });
  }

  // Métodos auxiliares del template
  getColorAlerta(tipo: string): string {
    return this.reportesService.getColorAlerta(tipo);
  }

  getIconoAlerta(tipo: string): string {
    return this.reportesService.getIconoAlerta(tipo);
  }

  // Método para verificar si hay datos significativos
  tieneDatosSignificativos(): boolean {
    return this.dashboardData && 
           this.dashboardData.reporteMensual && 
           (this.dashboardData.reporteMensual.resumen.transaccionesTotales > 0);
  }
}
