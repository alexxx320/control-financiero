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
    MatChipsModule
  ],
  template: `
    <div class="reportes-container">
      <h2>Reportes Financieros</h2>
      
      <!-- Filtros básicos -->
      <mat-card class="filtros-card mb-2">
        <mat-card-header>
          <mat-card-title>Filtros de Reporte</mat-card-title>
        </mat-card-header>
        <mat-card-content>
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
                    (click)="generarReporte()" 
                    [disabled]="cargando">
              <mat-icon>assessment</mat-icon>
              {{ cargando ? 'Generando...' : 'Generar Reporte' }}
            </button>

            <button mat-stroked-button 
                    (click)="cargarAlertas()" 
                    [disabled]="cargando">
              <mat-icon>notifications</mat-icon>
              Alertas
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-container">
        <mat-spinner [diameter]="50"></mat-spinner>
        <p>Generando reporte...</p>
      </div>

      <!-- Contenido principal -->
      <div *ngIf="!cargando">
        <!-- Resumen rápido -->
        <mat-card class="resumen-card" *ngIf="reporteMensual">
          <mat-card-header>
            <mat-card-title>Resumen del Período - {{ reporteMensual.periodo }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="resumen-stats">
              <div class="stat-item">
                <span class="stat-label">Total Ingresos:</span>
                <span class="stat-value ingresos">{{ reporteMensual.resumen.totalIngresos | currency:'COP':'symbol':'1.0-0' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Gastos:</span>
                <span class="stat-value gastos">{{ reporteMensual.resumen.totalGastos | currency:'COP':'symbol':'1.0-0' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Balance Neto:</span>
                <span class="stat-value" [ngClass]="{'positivo': reporteMensual.resumen.balanceNeto >= 0, 'negativo': reporteMensual.resumen.balanceNeto < 0}">
                  {{ reporteMensual.resumen.balanceNeto | currency:'COP':'symbol':'1.0-0' }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Transacciones:</span>
                <span class="stat-value">{{ reporteMensual.resumen.transaccionesTotales }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Alertas rápidas -->
        <mat-card class="alertas-resumen" *ngIf="alertas.length > 0">
          <mat-card-header>
            <mat-card-title>Alertas Activas ({{ alertas.length }})</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="alertas-lista">
              <div *ngFor="let alerta of alertas.slice(0, 3)" class="alerta-item">
                <mat-icon [style.color]="getColorAlerta(alerta.tipo)">{{ getIconoAlerta(alerta.tipo) }}</mat-icon>
                <span class="alerta-texto">{{ alerta.fondo }}: {{ alerta.mensaje }}</span>
                <mat-chip [style.background-color]="getColorAlerta(alerta.tipo)" 
                         [style.color]="'white'" 
                         class="prioridad-chip">
                  {{ alerta.prioridad }}
                </mat-chip>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Mensaje informativo si no hay datos -->
        <mat-card class="info-card" *ngIf="!reporteMensual || reporteMensual.fondos.length === 0">
          <mat-card-content>
            <div class="info-content">
              <mat-icon class="info-icon">info</mat-icon>
              <div>
                <h3>No hay datos para mostrar</h3>
                <p>No se encontraron transacciones para el período seleccionado.</p>
                <p>Prueba seleccionando un período diferente o crea algunas transacciones primero.</p>
              </div>
            </div>
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

    .filtros-form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filtros-form mat-form-field {
      min-width: 180px;
    }

    .resumen-stats {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: rgba(0,0,0,0.05);
      border-radius: 8px;
    }

    .stat-label {
      font-weight: 500;
      color: rgba(0,0,0,0.7);
    }

    .stat-value {
      font-weight: 600;
      font-size: 1.1em;
    }

    .stat-value.ingresos {
      color: #4caf50;
    }

    .stat-value.gastos {
      color: #f44336;
    }

    .stat-value.positivo {
      color: #4caf50;
    }

    .stat-value.negativo {
      color: #f44336;
    }

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
      margin: 0;
      padding-left: 20px;
    }

    @media (max-width: 768px) {
      .reportes-container {
        padding: 16px;
      }

      .filtros-form {
        flex-direction: column;
        align-items: stretch;
      }

      .filtros-form mat-form-field {
        min-width: auto;
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
  
  // Datos reales
  reporteMensual: ReporteMensual | null = null;
  reporteAnual: ReporteAnual | null = null;
  alertas: Alerta[] = [];
  estadisticas: EstadisticasGenerales | null = null;

  // Configuración de tablas
  dataSourceFondos = new MatTableDataSource<any>();
  dataSourceMeses = new MatTableDataSource<any>();
  displayedColumnsFondos: string[] = ['nombre', 'balanceInicial', 'ingresos', 'gastos', 'balanceFinal', 'transacciones'];
  displayedColumnsMeses: string[] = ['mes', 'ingresos', 'gastos', 'balance', 'transacciones'];

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
    console.log('🚀 Iniciando componente de reportes...');
    this.generarReporte();
    this.cargarEstadisticas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generarReporte(): void {
    const periodo = this.filtrosForm.get('periodo')?.value;
    console.log(`📈 Generando reporte para período: ${periodo}`);
    
    this.cargando = true;
    
    this.reportesService.generarReporteRapido(periodo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reporte: ReporteMensual | ReporteAnual) => {
          if ('mes' in reporte) {
            // Es un reporte mensual
            this.reporteMensual = reporte;
            this.dataSourceFondos.data = reporte.fondos;
            console.log('✅ Reporte mensual cargado:', this.reporteMensual);
          } else {
            // Es un reporte anual
            this.reporteAnual = reporte;
            this.dataSourceMeses.data = reporte.meses;
            console.log('✅ Reporte anual cargado:', this.reporteAnual);
          }
          
          this.cargando = false;
          this.notificationService.success('Reporte generado exitosamente');
        },
        error: (error: any) => {
          console.error('❌ Error al generar reporte:', error);
          this.cargando = false;
          this.notificationService.error('Error al generar el reporte');
        }
      });
  }

  cargarAlertas(): void {
    console.log('🚨 Cargando alertas financieras...');
    
    this.cargando = true;
    
    this.reportesService.obtenerAlertas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (alertas: Alerta[]) => {
          this.alertas = alertas;
          this.cargando = false;
          console.log('✅ Alertas cargadas:', this.alertas);
          
          if (alertas.length === 0) {
            this.notificationService.success('No hay alertas activas');
          } else {
            this.notificationService.info(`${alertas.length} alerta(s) encontrada(s)`);
          }
        },
        error: (error: any) => {
          console.error('❌ Error al cargar alertas:', error);
          this.cargando = false;
          this.notificationService.error('Error al cargar alertas');
        }
      });
  }

  cargarEstadisticas(): void {
    console.log('📈 Cargando estadísticas generales...');
    
    this.reportesService.obtenerEstadisticasGenerales()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (estadisticas: EstadisticasGenerales) => {
          this.estadisticas = estadisticas;
          console.log('✅ Estadísticas cargadas:', this.estadisticas);
        },
        error: (error: any) => {
          console.error('❌ Error al cargar estadísticas:', error);
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
