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
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatSnackBarModule
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

      <!-- Filtro de Período -->
      <mat-card class="filtro-periodo-card">
        <mat-card-content>
          <div class="filtro-periodo">
            <span class="filtro-label">Período:</span>
            <mat-form-field appearance="outline" class="filtro-select">
              <mat-select 
                [(value)]="filtroSeleccionado" 
                (selectionChange)="cambiarFiltro($event.value)"
                [disabled]="cargando">
                <mat-option 
                  *ngFor="let opcion of opcionesFiltro" 
                  [value]="opcion.valor">
                  {{ opcion.etiqueta }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            <span class="periodo-descripcion">{{ obtenerDescripcionPeriodo() }}</span>
          </div>
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
                <small>{{ obtenerDescripcionPeriodo() }}</small>
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
                <small>{{ obtenerDescripcionPeriodo() }}</small>
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
                <h3>{{ obtenerNumeroTransacciones() }}</h3>
                <p>Transacciones</p>
                <small>{{ obtenerDescripcionPeriodo() }}</small>
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
                <h3>{{ obtenerMayorGasto() }}</h3>
                <p>Mayor Gasto</p>
                <small>Transacción individual</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card mayor-ingreso">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>attach_money</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ obtenerMayorIngreso() }}</h3>
                <p>Mayor Ingreso</p>
                <small>Transacción individual</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Fondos y progreso -->
      <mat-card class="fondos-card">
        <mat-card-header>
          <mat-card-title>
            Progreso Ahorros
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
          
          <div *ngIf="!cargando && !error && obtenerFondosAhorro().length === 0" class="empty-state">
            <mat-icon>savings_off</mat-icon>
            <p>No hay fondos de ahorro disponibles</p>
            <button mat-raised-button color="primary" routerLink="/fondos">
              Crear Primer Fondo de Ahorro
            </button>
          </div>
          
          <div *ngIf="!cargando && !error && obtenerFondosAhorro().length > 0" class="fondos-list">
            <div *ngFor="let fondo of obtenerFondosAhorro(); trackBy: trackByFondo" class="fondo-item">
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

    .filtro-periodo-card {
      margin-bottom: 20px;
    }

    .filtro-periodo {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filtro-label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
      white-space: nowrap;
    }

    .filtro-select {
      min-width: 150px;
    }

    .filtro-select .mat-mdc-form-field {
      margin-bottom: 0;
    }

    .periodo-descripcion {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9em;
      font-style: italic;
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
    .stat-card.mayor-ingreso { border-left-color: #4caf50; }

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

    .filtro-periodo {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .filtro-select {
      width: 100%;
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
  
  resumenFinanciero: ResumenFinanciero | null = null;
  estadisticas: EstadisticasDashboard | null = null;
  fondos: Fondo[] = [];
  cargando = false;
  error: string | null = null;
  backendConectado = true;
  periodoActual = '';
  filtroSeleccionado: 'dia' | 'semana' | 'mes' | 'todas' = 'mes';
  
  opcionesFiltro = [
    { valor: 'dia', etiqueta: 'Hoy' },
    { valor: 'semana', etiqueta: 'Esta semana' },
    { valor: 'mes', etiqueta: 'Este mes' },
    { valor: 'todas', etiqueta: 'Todas' }
  ];

  constructor(
    private dashboardService: DashboardService,
    private fondoService: FondoService,
    private transaccionService: TransaccionService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.actualizarPeriodoActual();
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
    console.log('📊 Cargando datos del dashboard con filtro:', this.filtroSeleccionado);
    
    const filtrosFecha = this.obtenerFiltrosFecha();
    
    // Cargar todos los datos en paralelo
    const cargarDatos$ = forkJoin({
      resumen: this.dashboardService.obtenerResumenFinanciero(filtrosFecha.fechaInicio, filtrosFecha.fechaFin),
      estadisticas: this.dashboardService.obtenerEstadisticas(filtrosFecha.fechaInicio, filtrosFecha.fechaFin),
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

  cambiarFiltro(nuevoFiltro: 'dia' | 'semana' | 'mes' | 'todas'): void {
    this.filtroSeleccionado = nuevoFiltro;
    this.actualizarPeriodoActual();
    this.cargarDatos();
  }

  obtenerFiltrosFecha(): { fechaInicio?: string, fechaFin?: string } {
    const hoy = new Date();
    
    switch (this.filtroSeleccionado) {
      case 'dia':
        const inicioDia = new Date(hoy);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(hoy);
        finDia.setHours(23, 59, 59, 999);
        return {
          fechaInicio: inicioDia.toISOString().split('T')[0],
          fechaFin: finDia.toISOString().split('T')[0]
        };
        
      case 'semana':
        const inicioSemana = new Date(hoy);
        const diaActual = hoy.getDay();
        const diasHastaLunes = diaActual === 0 ? 6 : diaActual - 1;
        inicioSemana.setDate(hoy.getDate() - diasHastaLunes);
        inicioSemana.setHours(0, 0, 0, 0);
        
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        finSemana.setHours(23, 59, 59, 999);
        
        return {
          fechaInicio: inicioSemana.toISOString().split('T')[0],
          fechaFin: finSemana.toISOString().split('T')[0]
        };
        
      case 'mes':
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
        return {
          fechaInicio: inicioMes.toISOString().split('T')[0],
          fechaFin: finMes.toISOString().split('T')[0]
        };
        
      case 'todas':
      default:
        return {};
    }
  }

  obtenerDescripcionPeriodo(): string {
    const hoy = new Date();
    
    switch (this.filtroSeleccionado) {
      case 'dia':
        return hoy.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
        
      case 'semana':
        const inicioSemana = new Date(hoy);
        const diaActual = hoy.getDay();
        const diasHastaLunes = diaActual === 0 ? 6 : diaActual - 1;
        inicioSemana.setDate(hoy.getDate() - diasHastaLunes);
        
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        
        return `${inicioSemana.getDate()} - ${finSemana.getDate()} ${finSemana.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
        
      case 'mes':
        return hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
      case 'todas':
        return 'Desde el inicio';
        
      default:
        return '';
    }
  }

  obtenerNumeroTransacciones(): number {
    if (!this.estadisticas) return 0;
    
    switch (this.filtroSeleccionado) {
      case 'dia':
        return this.estadisticas.transaccionesHoy || 0;
        
      case 'semana':
      case 'mes':
      case 'todas':
        // Para todos estos casos, usar transaccionesMes que ahora contiene
        // las transacciones filtradas según el período seleccionado
        return this.estadisticas.transaccionesMes || 0;
        
      default:
        return 0;
    }
  }

  obtenerMayorGasto(): string {
    if (!this.estadisticas || !this.estadisticas.mayorGasto || this.estadisticas.mayorGasto <= 0) {
      return 'Sin datos';
    }
    return this.formatearMoneda(this.estadisticas.mayorGasto);
  }

  obtenerMayorIngreso(): string {
    if (!this.estadisticas || !this.estadisticas.mayorIngreso || this.estadisticas.mayorIngreso <= 0) {
      return 'Sin datos';
    }
    return this.formatearMoneda(this.estadisticas.mayorIngreso);
  }

  obtenerFondosAhorro(): Fondo[] {
    if (!this.fondos || this.fondos.length === 0) {
      return [];
    }
    
    // Filtrar solo fondos de tipo 'ahorro' (excluir fondos de tipo 'registro')
    return this.fondos.filter(fondo => fondo.tipo === 'ahorro');
  }

  private actualizarPeriodoActual(): void {
    this.periodoActual = this.obtenerDescripcionPeriodo();
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
