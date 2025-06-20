import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';

import { DashboardService } from '../../core/services/dashboard.service';
import { FondoService } from '../../core/services/fondo.service';
import { TransaccionService } from '../../core/services/transaccion.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ResumenFinanciero, EstadisticasDashboard } from '../../core/models/dashboard.model';
import { Fondo } from '../../core/models/fondo.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Estado de conexión -->
      <div *ngIf="!backendConectado" class="alerta-conexion">
        <mat-card class="warning-card">
          <mat-card-content>
            <div class="warning-content">
              <mat-icon>warning</mat-icon>
              <span>No se puede conectar con el servidor. Mostrando datos básicos.</span>
              <button mat-raised-button color="primary" (click)="reintentar()">
                Reintentar
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filtros -->
      <mat-card class="filtros-card mb-2">
        <mat-card-header>
          <mat-card-title>Filtros</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filtrosForm" class="filtros-form">
            <mat-form-field appearance="outline">
              <mat-label>Fecha Inicio</mat-label>
              <input matInput [matDatepicker]="fechaInicioPicker" formControlName="fechaInicio">
              <mat-datepicker-toggle matIconSuffix [for]="fechaInicioPicker"></mat-datepicker-toggle>
              <mat-datepicker #fechaInicioPicker></mat-datepicker>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Fecha Fin</mat-label>
              <input matInput [matDatepicker]="fechaFinPicker" formControlName="fechaFin">
              <mat-datepicker-toggle matIconSuffix [for]="fechaFinPicker"></mat-datepicker-toggle>
              <mat-datepicker #fechaFinPicker></mat-datepicker>
            </mat-form-field>
            
            <button mat-raised-button color="primary" (click)="aplicarFiltros()" [disabled]="cargando">
              {{ cargando ? 'Aplicando...' : 'Aplicar Filtros' }}
            </button>

            <button mat-stroked-button (click)="limpiarFiltros()" [disabled]="cargando">
              Limpiar
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Tarjetas de estadísticas -->
      <div class="estadisticas-grid mb-2">
        <mat-card class="stat-card ingresos">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ formatearMoneda(resumenFinanciero?.totalIngresos || 0) }}</h3>
                <p>Total Ingresos</p>
                <small *ngIf="periodoActual">{{ periodoActual }}</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card gastos">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>trending_down</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ formatearMoneda(resumenFinanciero?.totalGastos || 0) }}</h3>
                <p>Total Gastos</p>
                <small *ngIf="periodoActual">{{ periodoActual }}</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card balance" [ngClass]="{'positive': (resumenFinanciero?.balance ?? 0) >= 0, 'negative': (resumenFinanciero?.balance ?? 0) < 0}">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>{{ (resumenFinanciero?.balance ?? 0) >= 0 ? 'account_balance' : 'warning' }}</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ formatearMoneda(resumenFinanciero?.balance ?? 0) }}</h3>
                <p>Balance Total</p>
                <small>{{ (resumenFinanciero?.balance ?? 0) >= 0 ? 'Positivo' : 'Negativo' }}</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card fondos">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>savings</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ estadisticas?.fondosActivos || 0 }}</h3>
                <p>Fondos Activos</p>
                <small>de {{ estadisticas?.totalFondos || 0 }} totales</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card transacciones">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>receipt</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ estadisticas?.transaccionesMes || 0 }}</h3>
                <p>Transacciones</p>
                <small>Este mes</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card mayor-gasto">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>money_off</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ formatearMoneda(estadisticas?.mayorGasto || 0) }}</h3>
                <p>Mayor Gasto</p>
                <small>Promedio mensual</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Fondos y progreso -->
      <mat-card class="fondos-card">
        <mat-card-header>
          <mat-card-title>
            Progreso de Fondos
            <button mat-icon-button (click)="refrescarFondos()" [disabled]="cargando">
              <mat-icon>refresh</mat-icon>
            </button>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="cargando" class="loading-container">
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            <p>Cargando fondos...</p>
          </div>
          
          <div *ngIf="!cargando && error" class="error-state">
            <mat-icon>error</mat-icon>
            <p>{{ error }}</p>
            <button mat-raised-button color="primary" (click)="cargarDatos()">
              Reintentar
            </button>
          </div>
          
          <div *ngIf="!cargando && !error && fondos.length === 0" class="empty-state">
            <mat-icon>savings_off</mat-icon>
            <p>No hay fondos disponibles</p>
            <button mat-raised-button color="primary" routerLink="/fondos">
              Crear Primer Fondo
            </button>
          </div>
          
          <div *ngIf="!cargando && !error && fondos.length > 0" class="fondos-list">
            <div *ngFor="let fondo of fondos; trackBy: trackByFondo" class="fondo-item">
              <div class="fondo-info">
                <h4>{{ fondo.nombre }}</h4>
                <p>{{ fondo.tipo | titlecase }}</p>
                <small>
                  Saldo: {{ formatearMoneda(fondo.saldoActual) }}
                  <span *ngIf="fondo.metaAhorro && fondo.metaAhorro > 0">
                    / Meta: {{ formatearMoneda(fondo.metaAhorro) }}
                  </span>
                </small>
                <small *ngIf="fondo.descripcion" class="descripcion">
                  {{ fondo.descripcion }}
                </small>
              </div>
              <div class="fondo-progreso">
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="calcularProgreso(fondo)"
                  [color]="getColorProgreso(fondo)">
                </mat-progress-bar>
                <span class="progreso-text">{{ calcularProgreso(fondo) }}%</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Resumen por tipos de fondos -->
      <mat-card *ngIf="resumenFinanciero && resumenFinanciero.fondosPorTipo && resumenFinanciero.fondosPorTipo.length > 0" class="resumen-tipos-card">
        <mat-card-header>
          <mat-card-title>Resumen por Tipo de Fondo</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="tipos-grid">
            <div *ngFor="let tipo of resumenFinanciero?.fondosPorTipo" class="tipo-item">
              <div class="tipo-info">
                <h4>{{ tipo.tipo | titlecase }}</h4>
                <p>{{ tipo.cantidad }} fondo(s)</p>
                <p>{{ formatearMoneda(tipo.montoTotal) }}</p>
              </div>
              <div class="tipo-progreso">
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="tipo.progreso"
                  color="accent">
                </mat-progress-bar>
                <span>{{ tipo.progreso }}%</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .alerta-conexion {
      margin-bottom: 20px;
    }

    .warning-card {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
    }

    .warning-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .warning-content mat-icon {
      color: #856404;
    }

    .filtros-card {
      margin-bottom: 20px;
    }

    .filtros-form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filtros-form mat-form-field {
      min-width: 200px;
    }

    .estadisticas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      border-left: 4px solid;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .stat-card.ingresos { border-left-color: #4caf50; }
    .stat-card.gastos { border-left-color: #f44336; }
    .stat-card.balance.positive { border-left-color: #4caf50; }
    .stat-card.balance.negative { border-left-color: #f44336; }
    .stat-card.fondos { border-left-color: #2196f3; }
    .stat-card.transacciones { border-left-color: #ff9800; }
    .stat-card.mayor-gasto { border-left-color: #9c27b0; }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 1.5em;
      font-weight: 500;
    }

    .stat-info p {
      margin: 4px 0 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9em;
    }

    .stat-info small {
      color: rgba(0, 0, 0, 0.5);
      font-size: 0.8em;
    }

    .fondos-card {
      margin-bottom: 20px;
    }

    .fondos-card mat-card-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .loading-container {
      text-align: center;
      padding: 20px;
    }

    .loading-container p {
      margin-top: 16px;
      color: rgba(0, 0, 0, 0.6);
    }

    .error-state {
      text-align: center;
      padding: 40px 20px;
      color: #f44336;
    }

    .error-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: rgba(0, 0, 0, 0.3);
      margin-bottom: 16px;
    }

    .empty-state p {
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 20px;
    }

    .fondos-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .fondo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      transition: box-shadow 0.2s ease;
    }

    .fondo-item:hover {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .fondo-info h4 {
      margin: 0;
      font-size: 1.1em;
    }

    .fondo-info p {
      margin: 4px 0 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9em;
    }

    .fondo-info small {
      color: rgba(0, 0, 0, 0.5);
      font-size: 0.8em;
      display: block;
      margin-top: 2px;
    }

    .fondo-info small.descripcion {
      font-style: italic;
      margin-top: 4px;
    }

    .fondo-progreso {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 200px;
    }

    .fondo-progreso mat-progress-bar {
      flex: 1;
    }

    .progreso-text {
      font-weight: 500;
      min-width: 40px;
      text-align: right;
    }

    .resumen-tipos-card {
      margin-bottom: 20px;
    }

    .tipos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .tipo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    .tipo-info h4 {
      margin: 0;
      font-size: 1em;
    }

    .tipo-info p {
      margin: 2px 0;
      font-size: 0.9em;
      color: rgba(0, 0, 0, 0.6);
    }

    .tipo-progreso {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
    }

    .tipo-progreso mat-progress-bar {
      flex: 1;
    }

    .tipo-progreso span {
      font-size: 0.9em;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .filtros-form {
        flex-direction: column;
        align-items: stretch;
      }

      .filtros-form mat-form-field {
        min-width: auto;
      }

      .estadisticas-grid {
        grid-template-columns: 1fr;
      }

      .fondo-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .fondo-progreso {
        width: 100%;
      }

      .tipos-grid {
        grid-template-columns: 1fr;
      }

      .tipo-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .tipo-progreso {
        width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  filtrosForm: FormGroup;
  resumenFinanciero: ResumenFinanciero | null = null;
  estadisticas: EstadisticasDashboard | null = null;
  fondos: Fondo[] = [];
  cargando = false;
  error: string | null = null;
  backendConectado = true;
  periodoActual = '';

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private fondoService: FondoService,
    private transaccionService: TransaccionService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.filtrosForm = this.fb.group({
      fechaInicio: [null],
      fechaFin: [null]
    });

    // Establecer período actual
    const fechaActual = new Date();
    this.periodoActual = `${fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
  }

  ngOnInit(): void {
    console.log('🚀 Dashboard iniciando...');
    console.log('🔑 Token actual:', this.authService.getToken()?.substring(0, 30) + '...');
    console.log('👤 Usuario actual:', this.authService.getCurrentUser());
    
    this.verificarConectividadYCargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  verificarConectividadYCargar(): void {
    this.cargando = true;
    this.error = null;

    this.dashboardService.verificarConectividad()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (conectado) => {
          this.backendConectado = conectado;
          if (conectado) {
            console.log('✅ Backend conectado, cargando datos reales...');
            this.cargarDatos();
          } else {
            console.warn('⚠️ Backend no disponible, mostrando estado sin datos');
            this.mostrarEstadoSinDatos();
          }
        },
        error: (error) => {
          console.error('❌ Error verificando conectividad:', error);
          this.backendConectado = false;
          this.mostrarEstadoSinDatos();
        }
      });
  }

  cargarDatos(): void {
    if (!this.backendConectado) {
      this.mostrarEstadoSinDatos();
      return;
    }

    this.cargando = true;
    this.error = null;
    console.log('📊 Cargando datos del dashboard...');
    
    const filtros = this.obtenerFiltros();
    
    // Cargar todos los datos en paralelo
    const cargarDatos$ = forkJoin({
      resumen: this.dashboardService.obtenerResumenFinanciero(filtros.fechaInicio, filtros.fechaFin),
      estadisticas: this.dashboardService.obtenerEstadisticas(),
      fondos: this.fondoService.obtenerFondos()
    });

    cargarDatos$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: ({ resumen, estadisticas, fondos }) => {
          console.log('✅ Datos cargados:', { resumen, estadisticas, fondos });
          
          this.resumenFinanciero = resumen;
          this.estadisticas = estadisticas;
          this.fondos = fondos;
          
          this.notificationService.mostrarExito('Datos actualizados correctamente');
        },
        error: (error) => {
          console.error('❌ Error al cargar datos:', error);
          this.error = 'Error al cargar los datos del dashboard';
          this.notificationService.mostrarError('Error al cargar los datos');
          
          // Mostrar datos básicos si hay error
          this.mostrarEstadoSinDatos();
        }
      });
  }

  private obtenerFiltros(): { fechaInicio?: string, fechaFin?: string } {
    const formValues = this.filtrosForm.value;
    const filtros: any = {};
    
    if (formValues.fechaInicio) {
      filtros.fechaInicio = formValues.fechaInicio.toISOString().split('T')[0];
    }
    
    if (formValues.fechaFin) {
      filtros.fechaFin = formValues.fechaFin.toISOString().split('T')[0];
    }
    
    return filtros;
  }

  private mostrarEstadoSinDatos(): void {
    this.resumenFinanciero = {
      totalIngresos: 0,
      totalGastos: 0,
      balance: 0,
      fondosPorTipo: [],
      transaccionesPorCategoria: [],
      tendenciaMensual: []
    };

    this.estadisticas = {
      totalFondos: 0,
      fondosActivos: 0,
      transaccionesHoy: 0,
      transaccionesMes: 0,
      mayorGasto: 0,
      mayorIngreso: 0
    };

    this.fondos = [];
  }

  aplicarFiltros(): void {
    const filtros = this.obtenerFiltros();
    console.log('🔍 Aplicando filtros:', filtros);
    
    if (this.backendConectado) {
      this.cargarDatos();
    } else {
      this.notificationService.mostrarAdvertencia('No se puede aplicar filtros sin conexión al servidor');
    }
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    if (this.backendConectado) {
      this.cargarDatos();
    }
  }

  refrescarFondos(): void {
    if (!this.backendConectado) {
      this.notificationService.mostrarAdvertencia('No se puede refrescar sin conexión al servidor');
      return;
    }

    this.cargando = true;
    this.fondoService.obtenerFondos()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (fondos) => {
          this.fondos = fondos;
          this.notificationService.mostrarExito('Fondos actualizados');
        },
        error: (error) => {
          console.error('❌ Error al refrescar fondos:', error);
          this.notificationService.mostrarError('Error al refrescar fondos');
        }
      });
  }

  reintentar(): void {
    this.verificarConectividadYCargar();
  }

  calcularProgreso(fondo: Fondo): number {
    if (!fondo.metaAhorro || fondo.metaAhorro === 0) {
      return 0;
    }
    const progreso = (fondo.saldoActual / fondo.metaAhorro) * 100;
    return Math.min(Math.round(progreso), 100);
  }

  getColorProgreso(fondo: Fondo): 'primary' | 'accent' | 'warn' {
    const progreso = this.calcularProgreso(fondo);
    if (progreso >= 80) return 'primary';
    if (progreso >= 50) return 'accent';
    return 'warn';
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }

  trackByFondo(index: number, fondo: Fondo): string {
    return fondo._id || index.toString();
  }
}
