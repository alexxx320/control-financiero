import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Chart from 'chart.js/auto';

import { ReportesEjecutivosService } from '../../core/services/reportes-ejecutivos.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-reportes-ejecutivos',
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
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="reportes-container">
      <h1>📊 Dashboard Financiero Ejecutivo</h1>
      
      <mat-card class="controls-card">
        <mat-card-content>
          <div class="controls">
            <mat-form-field>
              <mat-label>Período</mat-label>
              <mat-select formControlName="periodo" (selectionChange)="cargarDatos()">
                <mat-option value="semana">Esta Semana</mat-option>
                <mat-option value="mes">Este Mes</mat-option>
                <mat-option value="trimestre">Este Trimestre</mat-option>
                <mat-option value="año">Este Año</mat-option>
              </mat-select>
            </mat-form-field>
            
            <button mat-stroked-button [matMenuTriggerFor]="exportMenu">
              <mat-icon>download</mat-icon>
              Exportar
            </button>
            <mat-menu #exportMenu="matMenu">
              <button mat-menu-item (click)="exportarPDF()">
                <mat-icon>picture_as_pdf</mat-icon>
                <span>PDF</span>
              </button>
              <button mat-menu-item (click)="exportarExcel()">
                <mat-icon>grid_on</mat-icon>
                <span>Excel</span>
              </button>
            </mat-menu>

            <button mat-raised-button color="primary" (click)="cargarDatos()" [disabled]="cargando">
              <mat-icon>refresh</mat-icon>
              Actualizar
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="cargando" class="loading">
        <mat-spinner></mat-spinner>
        <p>Cargando datos...</p>
      </div>

      <div *ngIf="!cargando && dashboardData" class="dashboard-content">
        <!-- KPIs -->
        <div class="kpis-grid">
          <mat-card class="kpi-card">
            <mat-card-content>
              <h3>💰 Ingresos Totales</h3>
              <p class="kpi-value positive">{{ dashboardData.kpis?.totalIngresos | currency:'COP':'symbol':'1.0-0' }}</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="kpi-card">
            <mat-card-content>
              <h3>💸 Gastos Totales</h3>
              <p class="kpi-value negative">{{ dashboardData.kpis?.totalGastos | currency:'COP':'symbol':'1.0-0' }}</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="kpi-card">
            <mat-card-content>
              <h3>📈 Utilidad Neta</h3>
              <p class="kpi-value" [ngClass]="{'positive': dashboardData.kpis?.utilidadNeta >= 0, 'negative': dashboardData.kpis?.utilidadNeta < 0}">
                {{ dashboardData.kpis?.utilidadNeta | currency:'COP':'symbol':'1.0-0' }}
              </p>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content>
              <h3>📊 Margen Utilidad</h3>
              <p class="kpi-value">{{ dashboardData.kpis?.margenUtilidad?.toFixed(1) || 0 }}%</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content>
              <h3>🏦 Fondos Activos</h3>
              <p class="kpi-value">{{ dashboardData.kpis?.fondosActivos || 0 }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content>
              <h3>📋 Transacciones/Día</h3>
              <p class="kpi-value">{{ dashboardData.kpis?.transaccionesPromedio?.toFixed(1) || 0 }}</p>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Gráficos -->
        <div class="charts-section">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>📈 Tendencia Mensual</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas #tendenciaChart width="400" height="200"></canvas>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>💰 Flujo de Caja</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas #flujoChart width="400" height="200"></canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Performance de Fondos -->
        <mat-card class="fondos-card" *ngIf="dashboardData.fondosPerformance && dashboardData.fondosPerformance.length > 0">
          <mat-card-header>
            <mat-card-title>🏦 Performance de Fondos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="fondos-grid">
              <div *ngFor="let fondo of dashboardData.fondosPerformance" class="fondo-item">
                <h4>{{ fondo.nombre }}</h4>
                <p><strong>Tipo:</strong> {{ fondo.tipo | titlecase }}</p>
                <p><strong>Saldo:</strong> {{ fondo.saldoActual | currency:'COP':'symbol':'1.0-0' }}</p>
                <p><strong>Progreso:</strong> {{ fondo.progresoMeta?.toFixed(1) || 0 }}%</p>
                <div class="rendimiento" [ngClass]="'rendimiento-' + fondo.rendimiento">
                  {{ fondo.rendimiento | titlecase }}
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!cargando && !dashboardData" class="no-data">
        <mat-card>
          <mat-card-content>
            <mat-icon class="large-icon">📊</mat-icon>
            <h3>No hay datos disponibles</h3>
            <p>Asegúrate de tener fondos y transacciones registradas en el sistema.</p>
            <button mat-raised-button color="primary" (click)="cargarDatos()">
              Intentar de nuevo
            </button>
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
      background: #f5f5f5;
      min-height: 100vh;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
      font-size: 2.5rem;
    }

    .controls {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .controls-card {
      margin-bottom: 30px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }

    .kpi-card {
      text-align: center;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      border-left: 4px solid #2196F3;
    }

    .kpi-card h3 {
      margin: 0 0 15px 0;
      color: #666;
      font-size: 1.1rem;
    }

    .kpi-value {
      font-size: 2rem;
      font-weight: bold;
      margin: 10px 0;
    }

    .kpi-value.positive {
      color: #4CAF50;
    }

    .kpi-value.negative {
      color: #F44336;
    }

    .charts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
    }

    .chart-card {
      min-height: 400px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .chart-card canvas {
      max-height: 300px;
    }

    .fondos-card {
      margin: 30px 0;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .fondos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .fondo-item {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #2196F3;
    }

    .fondo-item h4 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .fondo-item p {
      margin: 5px 0;
      color: #666;
    }

    .rendimiento {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      text-align: center;
      margin-top: 10px;
    }

    .rendimiento-excelente {
      background: #E8F5E8;
      color: #2E7D32;
    }

    .rendimiento-bueno {
      background: #E3F2FD;
      color: #1976D2;
    }

    .rendimiento-regular {
      background: #FFF3E0;
      color: #F57C00;
    }

    .rendimiento-malo {
      background: #FFEBEE;
      color: #D32F2F;
    }

    .loading {
      text-align: center;
      padding: 60px;
    }

    .loading p {
      margin-top: 20px;
      font-size: 1.2rem;
      color: #666;
    }

    .no-data {
      text-align: center;
      padding: 60px;
    }

    .no-data h3 {
      margin: 20px 0;
      color: #666;
    }

    .large-icon {
      font-size: 4rem;
      color: #ddd;
    }

    @media (max-width: 768px) {
      .reportes-container {
        padding: 10px;
      }

      h1 {
        font-size: 2rem;
      }

      .charts-section {
        grid-template-columns: 1fr;
      }
      
      .controls {
        flex-direction: column;
        align-items: stretch;
      }

      .kpis-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportesEjecutivosComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tendenciaChart') tendenciaChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('flujoChart') flujoChart!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private charts: Chart[] = [];
  
  filtrosForm: FormGroup;
  cargando = false;
  dashboardData: any = null;

  constructor(
    private fb: FormBuilder,
    private reportesEjecutivosService: ReportesEjecutivosService,
    private notificationService: NotificationService
  ) {
    this.filtrosForm = this.fb.group({
      periodo: ['mes']
    });
  }

  ngOnInit(): void {
    console.log('🚀 Iniciando Dashboard Ejecutivo...');
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    // Los gráficos se crearán después de cargar los datos
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  cargarDatos(): void {
    this.cargando = true;
    const periodo = this.filtrosForm.get('periodo')?.value || 'mes';
    
    console.log('📊 Cargando datos para período:', periodo);
    
    this.reportesEjecutivosService.obtenerDashboardData(periodo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('✅ Datos cargados:', data);
          this.dashboardData = data;
          this.cargando = false;
          
          // Crear gráficos después de que se actualice la vista
          setTimeout(() => this.crearGraficos(), 100);
        },
        error: (error) => {
          console.error('❌ Error al cargar datos:', error);
          this.cargando = false;
          this.notificationService.error('Error al cargar los datos del dashboard');
        }
      });
  }

  exportarPDF(): void {
    const periodo = this.filtrosForm.get('periodo')?.value || 'mes';
    console.log('📄 Exportando PDF para período:', periodo);
    
    this.reportesEjecutivosService.exportarPDF(periodo)
      .then(() => {
        this.notificationService.success('Reporte PDF generado exitosamente');
      })
      .catch((error) => {
        console.error('Error al exportar PDF:', error);
        this.notificationService.error('Error al generar el reporte PDF');
      });
  }

  exportarExcel(): void {
    const periodo = this.filtrosForm.get('periodo')?.value || 'mes';
    console.log('📊 Exportando Excel para período:', periodo);
    
    this.reportesEjecutivosService.exportarExcel(periodo)
      .then(() => {
        this.notificationService.success('Reporte Excel generado exitosamente');
      })
      .catch((error) => {
        console.error('Error al exportar Excel:', error);
        this.notificationService.error('Error al generar el reporte Excel');
      });
  }

  private crearGraficos(): void {
    this.destroyCharts();
    
    if (this.dashboardData) {
      this.crearGraficoTendencia();
      this.crearGraficoFlujo();
    }
  }

  private crearGraficoTendencia(): void {
    const ctx = this.tendenciaChart?.nativeElement?.getContext('2d');
    if (!ctx || !this.dashboardData.tendenciaMensual) {
      console.warn('⚠️ No se puede crear gráfico de tendencia: contexto o datos faltantes');
      return;
    }

    console.log('📈 Creando gráfico de tendencia con datos:', this.dashboardData.tendenciaMensual);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.dashboardData.tendenciaMensual.map((item: any) => item.mes || 'N/A'),
        datasets: [
          {
            label: 'Ingresos',
            data: this.dashboardData.tendenciaMensual.map((item: any) => item.ingresos || 0),
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Gastos',
            data: this.dashboardData.tendenciaMensual.map((item: any) => item.gastos || 0),
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Utilidad',
            data: this.dashboardData.tendenciaMensual.map((item: any) => item.utilidad || 0),
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '$' + Number(value).toLocaleString('es-CO');
              }
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private crearGraficoFlujo(): void {
    const ctx = this.flujoChart?.nativeElement?.getContext('2d');
    if (!ctx || !this.dashboardData.flujoCaja) {
      console.warn('⚠️ No se puede crear gráfico de flujo: contexto o datos faltantes');
      return;
    }

    console.log('📊 Creando gráfico de flujo con datos:', this.dashboardData.flujoCaja);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.dashboardData.flujoCaja.map((item: any) => item.fecha || 'N/A'),
        datasets: [
          {
            label: 'Entradas',
            data: this.dashboardData.flujoCaja.map((item: any) => item.entradas || 0),
            backgroundColor: 'rgba(76, 175, 80, 0.8)',
            borderColor: '#4CAF50',
            borderWidth: 1
          },
          {
            label: 'Salidas',
            data: this.dashboardData.flujoCaja.map((item: any) => -(item.salidas || 0)),
            backgroundColor: 'rgba(244, 67, 54, 0.8)',
            borderColor: '#F44336',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function(value: any) {
                return '
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => {
      try {
        chart.destroy();
      } catch (error) {
        console.warn('Error al destruir gráfico:', error);
      }
    });
    this.charts = [];
  }
}
 + Math.abs(Number(value)).toLocaleString('es-CO');
              }
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => {
      try {
        chart.destroy();
      } catch (error) {
        console.warn('Error al destruir gráfico:', error);
      }
    });
    this.charts = [];
  }
}
