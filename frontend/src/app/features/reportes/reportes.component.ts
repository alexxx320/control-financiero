import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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

            <button mat-raised-button color="primary" 
                    (click)="cargarDashboard()" 
                    [disabled]="cargando">
              <mat-icon>refresh</mat-icon>
              {{ cargando ? 'Cargando...' : 'Actualizar' }}
            </button>

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
            <mat-card-title>Indicadores Clave - {{ dashboardData.periodo }}</mat-card-title>
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

              <div class="kpi-item fondos">
                <div class="kpi-icon">
                  <mat-icon>account_balance</mat-icon>
                </div>
                <div class="kpi-content">
                  <span class="kpi-label">Fondos Activos</span>
                  <span class="kpi-value">{{ dashboardData.kpis.fondosActivos }}</span>
                </div>
              </div>

              <div class="kpi-item transacciones">
                <div class="kpi-icon">
                  <mat-icon>receipt</mat-icon>
                </div>
                <div class="kpi-content">
                  <span class="kpi-label">Transacciones/Día</span>
                  <span class="kpi-value">{{ dashboardData.kpis.transaccionesPromedio | number:'1.1-1' }}</span>
                </div>
              </div>
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

        <!-- Performance de fondos -->
        <mat-card class="fondos-performance-card" *ngIf="dashboardData?.fondosPerformance">
          <mat-card-header>
            <mat-card-title>Performance de Fondos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="fondos-grid">
              <div *ngFor="let fondo of dashboardData.fondosPerformance" class="fondo-item" [ngClass]="'rendimiento-' + fondo.rendimiento">
                <div class="fondo-header">
                  <h4>{{ fondo.nombre }}</h4>
                  <mat-chip [ngClass]="'chip-' + fondo.rendimiento">{{ fondo.rendimiento }}</mat-chip>
                </div>
                <div class="fondo-saldo">
                  <span class="label">Saldo Actual:</span>
                  <span class="value">{{ fondo.saldoActual | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
                <div class="fondo-progress">
                  <span class="progress-label">Progreso de Meta: {{ fondo.progresoMeta | number:'1.0-0' }}%</span>
                  <mat-progress-bar mode="determinate" [value]="fondo.progresoMeta"></mat-progress-bar>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Detalle de reportes por tabla -->
        <mat-card class="tabla-reportes-card" *ngIf="dashboardData?.reporteMensual">
          <mat-card-header>
            <mat-card-title>Detalle por Fondos - {{ dashboardData.reporteMensual.periodo }}</mat-card-title>
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

        <!-- Mensaje informativo si no hay datos -->
        <mat-card class="info-card" *ngIf="!dashboardData">
          <mat-card-content>
            <div class="info-content">
              <mat-icon class="info-icon">info</mat-icon>
              <div>
                <h3>No hay datos para mostrar</h3>
                <p>No se encontraron datos financieros para el período seleccionado.</p>
                <ul>
                  <li>Verifica que tengas fondos creados</li>
                  <li>Asegúrate de tener transacciones registradas</li>
                  <li>Prueba seleccionando un período diferente</li>
                </ul>
                <button mat-raised-button color="primary" (click)="cargarDashboard()">
                  <mat-icon>refresh</mat-icon>
                  Intentar de nuevo
                </button>
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

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 24px;
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

    /* Fondos Performance */
    .fondos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .fondo-item {
      padding: 20px;
      border-radius: 12px;
      border: 2px solid #e0e0e0;
      transition: border-color 0.3s ease;
    }

    .fondo-item.rendimiento-excelente {
      border-color: #4caf50;
      background: linear-gradient(135deg, #e8f5e8 0%, #f1f9f1 100%);
    }

    .fondo-item.rendimiento-bueno {
      border-color: #2196f3;
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
    }

    .fondo-item.rendimiento-regular {
      border-color: #ff9800;
      background: linear-gradient(135deg, #fff3e0 0%, #faf6f0 100%);
    }

    .fondo-item.rendimiento-malo {
      border-color: #f44336;
      background: linear-gradient(135deg, #ffebee 0%, #fdf4f4 100%);
    }

    .fondo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .fondo-header h4 {
      margin: 0;
      color: #333;
    }

    .chip-excelente {
      background-color: #4caf50;
      color: white;
    }

    .chip-bueno {
      background-color: #2196f3;
      color: white;
    }

    .chip-regular {
      background-color: #ff9800;
      color: white;
    }

    .chip-malo {
      background-color: #f44336;
      color: white;
    }

    .fondo-saldo {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .fondo-saldo .label {
      color: #666;
      font-weight: 500;
    }

    .fondo-saldo .value {
      font-weight: 600;
      color: #333;
    }

    .fondo-progress {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .progress-label {
      font-size: 0.9rem;
      color: #666;
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

    .info-content ul {
      margin: 0 0 16px 0;
      padding-left: 20px;
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

      .fondos-grid {
        grid-template-columns: 1fr;
      }

      .info-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
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
  displayedColumnsFondos: string[] = ['nombre', 'balanceInicial', 'ingresos', 'gastos', 'balanceFinal', 'transacciones'];

  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesService,
    private notificationService: NotificationService
  ) {
    this.filtrosForm = this.fb.group({
      periodo: ['mes']
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
    
    this.reportesService.obtenerDashboard(periodo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.dashboardData = data;
          
          // Configurar datos de la tabla
          if (data.reporteMensual?.fondos) {
            this.dataSourceFondos.data = data.reporteMensual.fondos;
          }
          
          this.cargando = false;
          console.log('✅ Dashboard cargado exitosamente:', this.dashboardData);
          this.notificationService.success('Reportes financieros actualizados');
        },
        error: (error: any) => {
          console.error('❌ Error al cargar dashboard:', error);
          this.cargando = false;
          this.notificationService.error('Error al cargar los reportes financieros');
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
}
