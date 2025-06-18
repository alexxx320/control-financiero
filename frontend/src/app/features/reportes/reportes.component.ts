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
import { MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DashboardService } from '../../core/services/dashboard.service';
import { TransaccionService } from '../../core/services/transaccion.service';
import { FondoService } from '../../core/services/fondo.service';

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
    MatTableModule
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

            <button mat-raised-button color="primary" (click)="generarReporte()">
              <mat-icon>assessment</mat-icon>
              Generar Reporte
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Resumen básico -->
      <mat-card class="resumen-card">
        <mat-card-header>
          <mat-card-title>Resumen del Período</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="resumen-stats">
            <div class="stat-item">
              <span class="stat-label">Total Ingresos:</span>
              <span class="stat-value ingresos">{{ resumenGeneral.totalIngresos | currency:'COP':'symbol':'1.0-0' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Gastos:</span>
              <span class="stat-value gastos">{{ resumenGeneral.totalGastos | currency:'COP':'symbol':'1.0-0' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Balance Neto:</span>
              <span class="stat-value" [ngClass]="{'positivo': resumenGeneral.balance >= 0, 'negativo': resumenGeneral.balance < 0}">
                {{ resumenGeneral.balance | currency:'COP':'symbol':'1.0-0' }}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Transacciones:</span>
              <span class="stat-value">{{ resumenGeneral.totalTransacciones }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Mensaje informativo -->
      <mat-card class="info-card mt-2">
        <mat-card-content>
          <div class="info-content">
            <mat-icon class="info-icon">info</mat-icon>
            <div>
              <h3>Reportes Avanzados En Desarrollo</h3>
              <p>Los gráficos y reportes detallados se están implementando. Próximamente incluirán:</p>
              <ul>
                <li>Gráficos de tendencias</li>
                <li>Análisis por categorías</li>
                <li>Comparaciones mensuales</li>
                <li>Exportación a PDF/Excel</li>
              </ul>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
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
  
  // Datos simulados
  resumenGeneral = {
    totalIngresos: 2500000,
    totalGastos: 1800000,
    balance: 700000,
    totalTransacciones: 45
  };

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private transaccionService: TransaccionService,
    private fondoService: FondoService
  ) {
    this.filtrosForm = this.fb.group({
      periodo: ['mes']
    });
  }

  ngOnInit(): void {
    this.generarReporte();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generarReporte(): void {
    console.log('Generando reporte con período:', this.filtrosForm.get('periodo')?.value);
    // Aquí se implementará la lógica real cuando esté el backend
  }
}
