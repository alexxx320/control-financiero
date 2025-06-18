import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { DashboardService } from '../../core/services/dashboard.service';
import { FondoService } from '../../core/services/fondo.service';
import { TransaccionService } from '../../core/services/transaccion.service';
import { ResumenFinanciero, EstadisticasDashboard } from '../../core/models/dashboard.model';
import { Fondo } from '../../core/models/fondo.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="dashboard-container">
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
            
            <button mat-raised-button color="primary" (click)="aplicarFiltros()">
              Aplicar Filtros
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
                <h3>{{ resumenFinanciero?.totalIngresos | currency:'COP':'symbol':'1.0-0' }}</h3>
                <p>Total Ingresos</p>
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
                <h3>{{ resumenFinanciero?.totalGastos | currency:'COP':'symbol':'1.0-0' }}</h3>
                <p>Total Gastos</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card balance" [ngClass]="{'positive': (resumenFinanciero?.balance ?? 0) >= 0, 'negative': (resumenFinanciero?.balance ?? 0) < 0}">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>account_balance</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ resumenFinanciero?.balance ?? 0 | currency:'COP':'symbol':'1.0-0' }}</h3>
                <p>Balance</p>
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
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Fondos y progreso -->
      <mat-card class="fondos-card">
        <mat-card-header>
          <mat-card-title>Progreso de Fondos</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="fondos-list">
            <div *ngFor="let fondo of fondos" class="fondo-item">
              <div class="fondo-info">
                <h4>{{ fondo.nombre }}</h4>
                <p>{{ fondo.tipo | titlecase }}</p>
              </div>
              <div class="fondo-progreso">
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="calcularProgreso(fondo)">
                </mat-progress-bar>
                <span class="progreso-text">{{ calcularProgreso(fondo) }}%</span>
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
    }

    .stat-card.ingresos {
      border-left-color: #4caf50;
    }

    .stat-card.gastos {
      border-left-color: #f44336;
    }

    .stat-card.balance.positive {
      border-left-color: #4caf50;
    }

    .stat-card.balance.negative {
      border-left-color: #f44336;
    }

    .stat-card.fondos {
      border-left-color: #2196f3;
    }

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

    .fondos-card {
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

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private fondoService: FondoService,
    private transaccionService: TransaccionService
  ) {
    this.filtrosForm = this.fb.group({
      fechaInicio: [null],
      fechaFin: [null]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos(): void {
    this.cargando = true;
    
    // Simular datos mientras no esté el backend
    this.resumenFinanciero = {
      totalIngresos: 2500000,
      totalGastos: 1800000,
      balance: 700000,
      fondosPorTipo: [],
      transaccionesPorCategoria: [],
      tendenciaMensual: []
    };

    this.estadisticas = {
      totalFondos: 5,
      fondosActivos: 3,
      transaccionesHoy: 2,
      transaccionesMes: 24,
      mayorGasto: 150000,
      mayorIngreso: 800000
    };

    // Cargar fondos
    this.fondoService.obtenerFondos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fondos) => this.fondos = fondos,
        error: (error) => console.error('Error al cargar fondos:', error)
      });

    this.cargando = false;
  }

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    console.log('Aplicando filtros:', filtros);
    // Implementar lógica de filtros cuando esté el backend
  }

  calcularProgreso(fondo: Fondo): number {
    // Simular progreso
    return Math.floor(Math.random() * 100);
  }
}
