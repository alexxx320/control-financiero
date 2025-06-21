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

import { ReportesEjecutivosService } from '../../core/services/reportes-ejecutivos.service';
import { NotificationService } from '../../core/services/notification.service';

// Declarar librerías externas
declare const Chart: any;
declare const jsPDF: any;
declare const html2canvas: any;

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
    <div class="reportes-container" #reporteContainer>
      <h1>📊 Dashboard Ejecutivo</h1>
      
      <mat-card>
        <mat-card-content>
          <form [formGroup]="filtrosForm">
            <mat-form-field>
              <mat-label>Período</mat-label>
              <mat-select formControlName="periodo" (selectionChange)="cargarDatos()">
                <mat-option value="semana">Esta Semana</mat-option>
                <mat-option value="mes">Este Mes</mat-option>
                <mat-option value="trimestre">Este Trimestre</mat-option>
                <mat-option value="año">Este Año</mat-option>
              </mat-select>
            </mat-form-field>
            
            <button mat-stroked-button [matMenuTriggerFor]="menu">
              <mat-icon>download</mat-icon>
              Exportar
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="exportarPDF()">PDF</button>
              <button mat-menu-item (click)="exportarExcel()">Excel</button>
            </mat-menu>

            <button mat-raised-button color="primary" (click)="cargarDatos()" [disabled]="cargando">
              Actualizar
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <div *ngIf="cargando" style="text-align: center; padding: 40px;">
        <mat-spinner></mat-spinner>
        <p>Cargando...</p>
      </div>

      <div *ngIf="!cargando && dashboardData">
        <!-- KPIs -->
        <div class="kpis">
          <mat-card>
            <mat-card-content>
              <h3>Ingresos</h3>
              <p>{{ dashboardData.kpis?.totalIngresos | currency:'COP':'symbol':'1.0-0' }}</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card>
            <mat-card-content>
              <h3>Gastos</h3>
              <p>{{ dashboardData.kpis?.totalGastos | currency:'COP':'symbol':'1.0-0' }}</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card>
            <mat-card-content>
              <h3>Utilidad</h3>
              <p [style.color]="dashboardData.kpis?.utilidadNeta >= 0 ? 'green' : 'red'">
                {{ dashboardData.kpis?.utilidadNeta | currency:'COP':'symbol':'1.0-0' }}
              </p>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Gráficos -->
        <div class="charts">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Tendencia</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas #tendenciaChart width="400" height="200"></canvas>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Flujo de Caja</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas #flujoChart width="400" height="200"></canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Performance de Fondos -->
        <mat-card *ngIf="dashboardData.fondosPerformance?.length">
          <mat-card-header>
            <mat-card-title>Performance de Fondos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="fondos-grid">
              <div *ngFor="let fondo of dashboardData.fondosPerformance">
                <p><strong>{{ fondo.nombre }}:</strong> {{ fondo.saldoActual | currency:'COP':'symbol':'1.0-0' }}</p>
                <p>Progreso: {{ fondo.progresoMeta?.toFixed(1) }}%</p>
                <p>Rendimiento: {{ fondo.rendimiento }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!cargando && !dashboardData">
        <mat-card>
          <mat-card-content>
            <p>Error al cargar datos. <button mat-button (click)="cargarDatos()">Reintentar</button></p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .reportes-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 30px;
    }
    
    form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    
    .kpis mat-card {
      text-align: center;
    }
    
    .kpis h3 {
      margin: 0 0 10px 0;
      color: #666;
    }
    
    .kpis p {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0;
    }

    .charts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }

    .fondos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    @media (max-width: 768px) {
      .charts {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportesEjecutivosComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tendenciaChart') tendenciaChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('flujoChart') flujoChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('reporteContainer') reporteContainer!: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();
  private charts: any[] = [];
  
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
    this.cargarLibreriasExternas();
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

  private cargarLibreriasExternas(): void {
    if (typeof Chart === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.min.js';
      script.onload = () => console.log('Chart.js cargado');
      document.head.appendChild(script);
    }

    if (typeof jsPDF === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => console.log('jsPDF cargado');
      document.head.appendChild(script);
    }

    if (typeof html2canvas === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => console.log('html2canvas cargado');
      document.head.appendChild(script);
    }
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
          
          setTimeout(() => this.crearGraficos(), 500);
          this.notificationService.success('Datos cargados correctamente');
        },
        error: (error) => {
          console.error('❌ Error al cargar datos:', error);
          this.cargando = false;
          this.notificationService.error('Error al cargar datos del dashboard');
        }
      });
  }

  exportarPDF(): void {
    const periodo = this.filtrosForm.get('periodo')?.value || 'mes';
    this.reportesEjecutivosService.exportarPDF(periodo)
      .then(() => this.notificationService.success('PDF generado'))
      .catch(() => this.notificationService.error('Error al generar PDF'));
  }

  exportarExcel(): void {
    const periodo = this.filtrosForm.get('periodo')?.value || 'mes';
    this.reportesEjecutivosService.exportarExcel(periodo)
      .then(() => this.notificationService.success('Excel generado'))
      .catch(() => this.notificationService.error('Error al generar Excel'));
  }

  private crearGraficos(): void {
    this.destroyCharts();
    
    if (typeof Chart === 'undefined') {
      setTimeout(() => this.crearGraficos(), 1000);
      return;
    }
    
    if (this.dashboardData) {
      this.crearGraficoTendencia();
      this.crearGraficoFlujo();
    }
  }

  private crearGraficoTendencia(): void {
    const ctx = this.tendenciaChart?.nativeElement?.getContext('2d');
    if (!ctx || !this.dashboardData.tendenciaMensual) return;

    try {
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.dashboardData.tendenciaMensual.map((item: any) => item.mes),
          datasets: [
            {
              label: 'Ingresos',
              data: this.dashboardData.tendenciaMensual.map((item: any) => item.ingresos),
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Gastos',
              data: this.dashboardData.tendenciaMensual.map((item: any) => item.gastos),
              borderColor: '#F44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      this.charts.push(chart);
    } catch (error) {
      console.error('Error al crear gráfico de tendencia:', error);
    }
  }

  private crearGraficoFlujo(): void {
    const ctx = this.flujoChart?.nativeElement?.getContext('2d');
    if (!ctx || !this.dashboardData.flujoCaja) return;

    try {
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.dashboardData.flujoCaja.map((item: any) => item.fecha),
          datasets: [
            {
              label: 'Entradas',
              data: this.dashboardData.flujoCaja.map((item: any) => item.entradas),
              backgroundColor: 'rgba(76, 175, 80, 0.8)',
              borderColor: '#4CAF50',
              borderWidth: 1
            },
            {
              label: 'Salidas',
              data: this.dashboardData.flujoCaja.map((item: any) => -item.salidas),
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
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      this.charts.push(chart);
    } catch (error) {
      console.error('Error al crear gráfico de flujo:', error);
    }
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
