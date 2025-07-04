import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip'; // 🆕 NUEVO
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FondoService } from '../../core/services/fondo.service';
import { Fondo, TipoFondo, CreateFondoDto, UpdateFondoDto, PrestamoUtils, ProgresoPrestamo, DeudaUtils } from '../../core/models/fondo.model';
import { FondoDetalleModalComponent } from '../../shared/components/fondo-detalle-modal.component';
import { NotificationService } from '../../core/services/notification.service';

// 🆕 NUEVO: Importaciones para crear transacciones desde fondos
import { TransaccionDialogComponent } from '../transacciones/transaccion-dialog.component';
import { TransaccionService } from '../../core/services/transaccion.service';
import { CategoriaTransaccion } from '../../core/models/transaccion.model';

@Component({
  selector: 'app-fondos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatChipsModule,
    MatGridListModule,
    MatTooltipModule // 🆕 NUEVO
  ],
  template: `
    <div class="fondos-container">
      <div class="header-section mb-2">
        <div class="header-content">
          <h2>Gestión de Fondos</h2>
          <button mat-raised-button color="primary" (click)="abrirDialogoFondo()">
            <mat-icon>add</mat-icon>
            Nuevo Fondo
          </button>
        </div>
      </div>

      <mat-card class="form-card mb-2" *ngIf="mostrarFormulario">
        <mat-card-header>
          <mat-card-title>{{ fondoEditando ? 'Editar Fondo' : 'Nuevo Fondo' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="fondoForm" (ngSubmit)="guardarFondo()" class="fondo-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre del Fondo</mat-label>
                <input matInput formControlName="nombre" placeholder="Ej: Fondo de Emergencia">
                <mat-error *ngIf="fondoForm.get('nombre')?.hasError('required')">
                  El nombre es requerido
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="descripcion" rows="3" 
                          placeholder="Descripción opcional del fondo"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Tipo de Fondo</mat-label>
                <mat-select formControlName="tipo" (selectionChange)="onTipoChange($event.value)">
                  <mat-option value="registro">
                    📝 Registro
                  </mat-option>
                  <mat-option value="ahorro">
                    💰 Ahorro
                  </mat-option>
                  <mat-option value="prestamo">
                    💵 Préstamo
                  </mat-option>
                  <mat-option value="deuda">
                    🔴 Deuda
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="fondoForm.get('tipo')?.hasError('required')">
                  El tipo es requerido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>
                  {{ tipoSeleccionado === 'prestamo' ? 'Monto Prestado (se convertirá a negativo)' : 'Saldo ' + (fondoEditando ? 'Actual' : 'Inicial') }}
                </mat-label>
                <input matInput type="number" formControlName="saldoActual" 
                       [placeholder]="tipoSeleccionado === 'prestamo' ? 'Ej: 100000 (se guardará como -100000)' : '0'" 
                       step="0.01">
                <span matTextPrefix>$</span>
                <mat-hint *ngIf="tipoSeleccionado === 'prestamo'">
                  💡 Para préstamos, ingresa el monto positivo que prestaste
                </mat-hint>
                <mat-hint *ngIf="fondoEditando && tipoSeleccionado !== 'prestamo'">
                  El saldo solo se modifica mediante transacciones
                </mat-hint>
                <mat-error *ngIf="fondoForm.get('saldoActual')?.hasError('required')">
                  El saldo inicial es requerido
                </mat-error>
              </mat-form-field>
            </div>

            <!-- 🔧 CAMPO META CONDICIONAL Y OBLIGATORIO -->
            <div class="form-row" *ngIf="tipoSeleccionado === 'ahorro'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Meta de Ahorro *</mat-label>
                <input matInput type="number" formControlName="metaAhorro" 
                       placeholder="Ingresa tu meta (ej: 1000000)" min="1" step="1000" required>
                <span matTextPrefix>$</span>
                <mat-hint><strong>Obligatorio:</strong> Define tu meta de ahorro para este fondo</mat-hint>
                <mat-error *ngIf="fondoForm.get('metaAhorro')?.hasError('required')">
                  La meta de ahorro es obligatoria para fondos de ahorro
                </mat-error>
                <mat-error *ngIf="fondoForm.get('metaAhorro')?.hasError('min')">
                  La meta debe ser mayor a $0 (mínimo $1)
                </mat-error>
              </mat-form-field>
            </div>

            <!-- 🔧 NUEVO: CAMPO META PARA PRÉSTAMOS -->
            <div class="form-row" *ngIf="tipoSeleccionado === 'prestamo'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Monto Total del Préstamo *</mat-label>
                <input matInput type="number" formControlName="metaAhorro" 
                       placeholder="Monto total prestado (ej: 100000)" min="1" step="1000" required>
                <span matTextPrefix>$</span>
                <mat-hint><strong>Obligatorio:</strong> El monto total que prestaste (usado para calcular el progreso de pago)</mat-hint>
                <mat-error *ngIf="fondoForm.get('metaAhorro')?.hasError('required')">
                  El monto del préstamo es obligatorio
                </mat-error>
                <mat-error *ngIf="fondoForm.get('metaAhorro')?.hasError('min')">
                  El monto debe ser mayor a $0
                </mat-error>
              </mat-form-field>
            </div>

            <!-- 🆕 NUEVO: CAMPO META PARA DEUDAS -->
            <div class="form-row" *ngIf="tipoSeleccionado === 'deuda'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Monto Total de la Deuda *</mat-label>
                <input matInput type="number" formControlName="metaAhorro" 
                       placeholder="Monto total que debes (ej: 50000)" min="1" step="1000" required>
                <span matTextPrefix>$</span>
                <mat-hint><strong>Obligatorio:</strong> El monto total que debes (usado para calcular el progreso de pago)</mat-hint>
                <mat-error *ngIf="fondoForm.get('metaAhorro')?.hasError('required')">
                  El monto de la deuda es obligatorio
                </mat-error>
                <mat-error *ngIf="fondoForm.get('metaAhorro')?.hasError('min')">
                  El monto debe ser mayor a $0
                </mat-error>
              </mat-form-field>
            </div>



            <div class="form-actions">
              <button mat-button type="button" (click)="cancelarEdicion()">
                Cancelar
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="fondoForm.invalid || guardando">
                {{ fondoEditando ? 'Actualizar' : 'Crear' }} Fondo
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <div class="fondos-grid">
        <mat-card *ngFor="let fondo of fondos" class="fondo-card">
          <mat-card-header>
            <div mat-card-avatar class="fondo-avatar">
              <mat-icon>{{ obtenerIconoTipo(fondo.tipo) }}</mat-icon>
            </div>
            <mat-card-title>{{ fondo.nombre }}</mat-card-title>
            <mat-card-subtitle>{{ fondo.tipo | titlecase }}</mat-card-subtitle>
            <div class="card-actions">
              <button mat-icon-button (click)="editarFondo(fondo)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="eliminarFondo(fondo)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </mat-card-header>
          
          <mat-card-content class="fondo-content">
            <div class="fondo-info">
              <p *ngIf="fondo.descripcion" class="descripcion">{{ fondo.descripcion }}</p>
              
              <div class="saldo-info">
                <div class="saldo-label">
                  {{ PrestamoUtils.esPrestamo(fondo) ? PrestamoUtils.getTextoSaldo(fondo) : DeudaUtils.esDeuda(fondo) ? DeudaUtils.getTextoSaldo(fondo) : (fondo.saldoActual >= 0 ? 'Saldo Actual:' : 'Deuda Actual:') }}
                </div>
                <div class="saldo-valor" [class]="fondo.saldoActual >= 0 ? 'saldo-positivo' : 'saldo-negativo'">
                  {{ PrestamoUtils.esPrestamo(fondo) ? PrestamoUtils.formatearMonto(fondo) : DeudaUtils.esDeuda(fondo) ? DeudaUtils.formatearMonto(fondo) : (fondo.saldoActual >= 0 ? fondo.saldoActual : -fondo.saldoActual) | currency:'COP':'symbol':'1.0-0' }}
                </div>
              </div>

              <div class="meta-info" *ngIf="fondo.tipo === 'ahorro' && fondo.metaAhorro && fondo.metaAhorro > 0">
                <div class="meta-label">Meta de Ahorro:</div>
                <div class="meta-valor">{{ fondo.metaAhorro | currency:'COP':'symbol':'1.0-0' }}</div>
              </div>

              <!-- Información específica para Préstamos -->
              <div class="prestamo-info" *ngIf="PrestamoUtils.esPrestamo(fondo)">
                <div class="prestamo-stats">
                  <div class="stat-item">
                    <span class="stat-label">Monto Prestado:</span>
                    <span class="stat-value prestado">{{ fondo.metaAhorro | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Monto Pagado:</span>
                    <span class="stat-value pagado">{{ PrestamoUtils.calcularProgreso(fondo).montoPagado | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Pendiente:</span>
                    <span class="stat-value pendiente">{{ PrestamoUtils.calcularProgreso(fondo).montoPendiente | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                </div>
              </div>

              <!-- 🆕 NUEVO: Información específica para Deudas -->
              <div class="deuda-info" *ngIf="DeudaUtils.esDeuda(fondo)">
                <div class="deuda-stats">
                  <div class="stat-item">
                    <span class="stat-label">Total Deuda:</span>
                    <span class="stat-value total-deuda">{{ fondo.metaAhorro | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Monto Pagado:</span>
                    <span class="stat-value pagado">{{ DeudaUtils.calcularProgreso(fondo).montoPagado | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Pendiente:</span>
                    <span class="stat-value pendiente">{{ DeudaUtils.calcularProgreso(fondo).montoPendiente | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                </div>
              </div>

              <!-- Barra de Progreso para Ahorros -->
              <div class="progreso-section" *ngIf="fondo.tipo === 'ahorro' && fondo.metaAhorro && fondo.metaAhorro > 0 && fondo.saldoActual > 0">
                <div class="progreso-header">
                  <span>Progreso hacia la meta:</span>
                  <span class="progreso-porcentaje">{{ calcularProgresoMeta(fondo) }}%</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="calcularProgresoMeta(fondo)">
                </mat-progress-bar>
              </div>

              <!-- Barra de Progreso para Préstamos -->
              <div class="progreso-section" *ngIf="PrestamoUtils.esPrestamo(fondo)">
                <div class="progreso-header">
                  <span>Progreso de pago:</span>
                  <span class="progreso-porcentaje prestamo">{{ PrestamoUtils.calcularProgreso(fondo).porcentajePagado.toFixed(1) }}%</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="PrestamoUtils.calcularProgreso(fondo).porcentajePagado"
                  class="prestamo-progress">
                </mat-progress-bar>
                <div class="progreso-status" *ngIf="PrestamoUtils.calcularProgreso(fondo).estaCompletado">
                  🎉 ¡Préstamo completamente pagado!
                </div>
              </div>

              <!-- 🆕 NUEVO: Barra de Progreso para Deudas -->
              <div class="progreso-section" *ngIf="DeudaUtils.esDeuda(fondo)">
                <div class="progreso-header">
                  <span>Progreso de pago:</span>
                  <span class="progreso-porcentaje deuda">{{ DeudaUtils.calcularProgreso(fondo).porcentajePagado.toFixed(1) }}%</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="DeudaUtils.calcularProgreso(fondo).porcentajePagado"
                  class="deuda-progress">
                </mat-progress-bar>
                <div class="progreso-status" *ngIf="DeudaUtils.calcularProgreso(fondo).estaLiquidada">
                  🎉 ¡Deuda completamente liquidada!
                </div>
              </div>

              <div class="fecha-creacion" *ngIf="fondo.fechaCreacion">
                Creado: {{ fondo.fechaCreacion | date:'dd/MM/yyyy' }}
              </div>
            </div>
          </mat-card-content>

          <!-- 🆕 BOTONES MOVIDOS AL FINAL DE LA TARJETA -->
          <mat-card-actions class="card-actions-bottom">
            <button mat-button color="primary" (click)="verDetalleFondo(fondo)">
              <mat-icon>visibility</mat-icon>
              Ver Detalle
            </button>
            <!-- 🆕 Botón circular compacto para crear transacción -->
            <button mat-fab color="accent" (click)="crearTransaccionEnFondo(fondo)" 
                    class="btn-add-transaction"
                    matTooltip="Nueva transacción">
              <mat-icon>add</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="nuevo-fondo-card" (click)="abrirDialogoFondo()" 
                  *ngIf="!mostrarFormulario">
          <mat-card-content>
            <div class="nuevo-fondo-content">
              <mat-icon class="add-icon">add_circle_outline</mat-icon>
              <h3>Crear Nuevo Fondo</h3>
              <p>Agrega un nuevo fondo para organizar tus finanzas</p>
            </div>
          </mat-card-content>
        </mat-card>
    <!-- 🔧 INFORMACIÓN DE TIPOS DE FONDO -->
    <mat-card class="info-card mb-2">
      <mat-card-content>
        <div class="tipos-info">
          <h3><mat-icon>info</mat-icon> Tipos de Fondos Disponibles</h3>
          <div class="tipos-grid">
            <div class="tipo-item registro">
              <mat-icon>assignment</mat-icon>
              <div class="tipo-content">
                <h4>📝 Registro</h4>
                <p>Para llevar control de ingresos y gastos sin metas específicas</p>
                <small>• Sin meta de ahorro • Control de movimientos</small>
              </div>
            </div>
            <div class="tipo-item ahorro">
              <mat-icon>savings</mat-icon>
              <div class="tipo-content">
                <h4>💰 Ahorro</h4>
                <p>Para ahorrar dinero con metas específicas</p>
                <small>• Con meta de ahorro • Seguimiento de progreso</small>
              </div>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .fondos-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header-section {
      margin-bottom: 20px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h2 {
      margin: 0;
      font-weight: 500;
    }

    .form-card {
      margin-bottom: 20px;
    }

    .fondo-form {
      max-width: 600px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }



    .fondos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      align-items: stretch; /* 🆕 Asegurar que todas las tarjetas tengan la misma altura */
    }

    .fondo-card {
      transition: all 0.3s ease;
      border-left: 4px solid #2196f3;
      display: flex;
      flex-direction: column;
      height: 100%; /* 🆕 Altura completa para consistencia */
    }

    .fondo-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    /* 🆕 NUEVO: Hacer que el contenido se expanda para empujar botones abajo */
    .fondo-card .fondo-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .fondo-card .fondo-info {
      flex: 1;
    }

    .fondo-card mat-card-header {
      position: relative;
    }

    .card-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 4px;
    }

    .fondo-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: white;
      background-color: #2196f3;
    }

    .fondo-info {
      margin-top: 16px;
    }

    .descripcion {
      color: rgba(0,0,0,0.6);
      margin-bottom: 16px;
      font-style: italic;
    }

    .meta-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      padding: 8px;
      background-color: rgba(0,0,0,0.05);
      border-radius: 4px;
    }

    .saldo-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      padding: 12px;
      background-color: rgba(33, 150, 243, 0.1);
      border-radius: 4px;
      border-left: 4px solid #2196f3;
    }

    .saldo-label, .meta-label {
      font-weight: 500;
    }

    .saldo-valor {
      font-weight: 600;
      font-size: 1.1em;
    }

    .saldo-positivo {
      color: #2196f3;
    }

    .saldo-negativo {
      color: #f44336;
    }

    /* Estilos específicos para préstamos */
    .prestamo-info {
      background: linear-gradient(135deg, #fff3e0 0%, #ffecb3 100%);
      border-radius: 8px;
      padding: 12px;
      border-left: 4px solid #ff9800;
      margin-bottom: 16px;
    }

    .prestamo-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      font-weight: 500;
      color: #555;
    }

    .stat-value {
      font-weight: 600;
    }

    .stat-value.prestado {
      color: #ff9800;
    }

    .stat-value.pagado {
      color: #4caf50;
    }

    .stat-value.pendiente {
      color: #f44336;
    }

    .stat-value.total-deuda {
      color: #d32f2f;
      font-weight: 700;
    }

    .progreso-porcentaje.prestamo {
      color: #ff9800;
    }

    .prestamo-progress {
      height: 8px;
      border-radius: 4px;
    }

    .progreso-status {
      text-align: center;
      font-weight: 500;
      color: #4caf50;
      margin-top: 8px;
      padding: 8px;
      background: #e8f5e8;
      border-radius: 6px;
    }

    /* 🆕 NUEVO: Estilos específicos para deudas */
    .deuda-info {
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
      border-radius: 8px;
      padding: 12px;
      border-left: 4px solid #f44336;
      margin-bottom: 16px;
    }

    .deuda-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .progreso-porcentaje.deuda {
      color: #f44336;
    }

    .deuda-progress {
      height: 8px;
      border-radius: 4px;
    }

    .meta-valor {
      font-weight: 600;
      color: #2196f3;
    }

    .progreso-section {
      margin: 16px 0;
    }

    .progreso-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9em;
    }

    .progreso-porcentaje {
      font-weight: 600;
    }

    .balance-info {
      text-align: center;
      margin-top: 8px;
      font-size: 0.9em;
      color: rgba(0,0,0,0.7);
    }

    .fecha-creacion {
      font-size: 0.8em;
      color: rgba(0,0,0,0.5);
      text-align: right;
      margin-top: 16px;
    }

    /* 🆕 NUEVO: Estilos para botones al final de la tarjeta */
    .fondo-card .card-actions-bottom {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      margin-top: auto; /* 🆕 Empuja los botones hacia abajo */
      border-top: 1px solid rgba(0,0,0,0.05);
      background-color: rgba(0,0,0,0.02);
    }

    .fondo-card .card-actions-bottom .btn-add-transaction {
      width: 40px;
      height: 40px;
      min-height: 40px;
      transform: scale(0.8);
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .fondo-card .card-actions-bottom .btn-add-transaction:hover {
      transform: scale(0.9);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .fondo-card .card-actions-bottom button mat-icon {
      margin-right: 4px;
    }

    .fondo-card .card-actions-bottom .btn-add-transaction mat-icon {
      margin-right: 0;
      font-size: 20px;
    }

    .nuevo-fondo-card {
      border: 2px dashed #ccc;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 200px;
      display: flex;
      align-items: center;
    }

    .nuevo-fondo-card:hover {
      border-color: #2196f3;
      background-color: rgba(33, 150, 243, 0.05);
    }

    .nuevo-fondo-content {
      text-align: center;
      width: 100%;
      color: rgba(0,0,0,0.6);
    }

    .add-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .nuevo-fondo-card:hover .add-icon {
      color: #2196f3;
    }

    @media (max-width: 768px) {
      .fondos-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .fondos-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }

      .card-actions {
        position: relative;
        top: auto;
        right: auto;
        margin-top: 8px;
      }

      /* 🆕 NUEVO: Ajustes para botones al final en móvil */
      .fondo-card .card-actions-bottom {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
      }

      .fondo-card .card-actions-bottom .btn-add-transaction {
        transform: scale(0.75);
      }
    }
  `]
})
export class FondosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  fondos: Fondo[] = [];
  tiposFondo: TipoFondo[] = [];
  fondoForm: FormGroup;
  mostrarFormulario = false;
  fondoEditando: Fondo | null = null;
  guardando = false;
  tipoSeleccionado: TipoFondo = 'registro'; // 🔧 AGREGADO
  
  // 🆕 NUEVO: Hacer PrestamoUtils disponible en el template
  PrestamoUtils = PrestamoUtils;
  
  // 🆕 NUEVO: Hacer DeudaUtils disponible en el template
  DeudaUtils = DeudaUtils;
  
  // 🆕 NUEVO: Variables para transacciones
  categorias: CategoriaTransaccion[] = [];

  constructor(
    private fb: FormBuilder,
    private fondoService: FondoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    // 🆕 NUEVO: Servicio de transacciones
    private transaccionService: TransaccionService
  ) {
    this.fondoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      tipo: ['registro', Validators.required], // 🔧 Default: registro
      saldoActual: [0, [Validators.required, Validators.min(0)]],
      metaAhorro: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.cargarTiposFondo();
    this.cargarFondos();
    
    // 🆕 NUEVO: Cargar categorías para transacciones
    this.categorias = this.transaccionService.obtenerCategorias();
    
    // 🔧 Escuchar cambios en el tipo para manejar validación de meta
    this.fondoForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.onTipoChange(tipo);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTiposFondo(): void {
    this.tiposFondo = this.fondoService.obtenerTiposFondo();
  }

  cargarFondos(): void {
    console.log('🏦 Cargando fondos desde el backend...');
    
    this.fondoService.obtenerFondos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fondos) => {
          console.log('✅ Fondos cargados exitosamente:', fondos);
          this.fondos = fondos;
        },
        error: (error) => {
          console.error('❌ Error cargando fondos:', error);
          
          let mensaje = 'Error al cargar fondos';
          if (error.message) {
            mensaje = error.message;
          }
          
          this.notificationService.error(mensaje);
          this.fondos = [];
        }
      });
    
    // También suscribirse a cambios en tiempo real
    this.fondoService.fondos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(fondos => {
        this.fondos = fondos;
      });
  }

  abrirDialogoFondo(): void {
    this.mostrarFormulario = true;
    this.fondoEditando = null;
    this.fondoForm.reset({
      tipo: 'registro',  // Default: registro
      saldoActual: 0,
      metaAhorro: 0
    });
    this.tipoSeleccionado = 'registro';
    
    // Habilitar el campo saldoActual al crear
    this.fondoForm.get('saldoActual')?.enable();
    this.onTipoChange('registro'); // Aplicar validaciones iniciales
  }

  editarFondo(fondo: Fondo): void {
    this.mostrarFormulario = true;
    this.fondoEditando = fondo;
    this.tipoSeleccionado = fondo.tipo;
    
    this.fondoForm.patchValue({
      nombre: fondo.nombre,
      descripcion: fondo.descripcion || '',
      tipo: fondo.tipo,
      // 🔧 NUEVO: Para préstamos y deudas, mostrar el saldo como positivo en el formulario
      saldoActual: (PrestamoUtils.esPrestamo(fondo) || DeudaUtils.esDeuda(fondo)) ? Math.abs(fondo.saldoActual) : (fondo.saldoActual || 0),
      metaAhorro: fondo.metaAhorro || 0
    });
    
    // Deshabilitar el campo saldoActual al editar
    this.fondoForm.get('saldoActual')?.disable();
    
    // Aplicar validaciones según el tipo
    this.onTipoChange(fondo.tipo);
  }

  guardarFondo(): void {
    if (this.fondoForm.invalid || this.guardando) return;

    this.guardando = true;
    const fondoData = this.fondoForm.value;

    console.log('💾 Guardando fondo:', fondoData);

    if (this.fondoEditando) {
      // Actualizar fondo existente
      const updateData: UpdateFondoDto = {
        nombre: fondoData.nombre,
        descripcion: fondoData.descripcion,
        tipo: fondoData.tipo,
        // 🔧 Meta obligatoria para fondos de ahorro, préstamos y deudas
        metaAhorro: (fondoData.tipo === 'ahorro' || fondoData.tipo === 'prestamo' || fondoData.tipo === 'deuda') ? (fondoData.metaAhorro || 0) : 0
      };

      this.fondoService.actualizarFondo(this.fondoEditando._id!, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (fondoActualizado) => {
            console.log('✅ Fondo actualizado:', fondoActualizado);
            this.notificationService.success('Fondo actualizado. Nota: El saldo solo se modifica mediante transacciones.');
            this.cancelarEdicion();
            this.guardando = false;
          },
          error: (error) => {
            console.error('❌ Error actualizando fondo:', error);
            this.manejarErrorGuardado(error);
          }
        });
    } else {
      // Crear nuevo fondo
      const createData: CreateFondoDto = {
        nombre: fondoData.nombre,
        descripcion: fondoData.descripcion,
        tipo: fondoData.tipo,
        saldoActual: fondoData.saldoActual || 0,
        // 🔧 Meta obligatoria para fondos de ahorro, préstamos y deudas
        metaAhorro: (fondoData.tipo === 'ahorro' || fondoData.tipo === 'prestamo' || fondoData.tipo === 'deuda') ? (fondoData.metaAhorro || 0) : 0
      };

      // 🔧 NUEVO: Lógica especial para préstamos
      if (fondoData.tipo === 'prestamo') {
        // Para préstamos, convertir el saldo inicial a negativo si es positivo
        if (createData.saldoActual! > 0) {
          createData.saldoActual = -Math.abs(createData.saldoActual!);
        }
        console.log('💵 Préstamo: Saldo convertido a negativo:', createData.saldoActual);
      } else if (fondoData.tipo === 'deuda') {
        // 🆕 NUEVO: Lógica especial para deudas
        // Para deudas, convertir el saldo inicial a negativo si es positivo
        if (createData.saldoActual! > 0) {
          createData.saldoActual = -Math.abs(createData.saldoActual!);
        }
        console.log('🔴 Deuda: Saldo convertido a negativo:', createData.saldoActual);
      }

      this.fondoService.crearFondo(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (nuevoFondo) => {
            console.log('✅ Fondo creado:', nuevoFondo);
            this.notificationService.success(
              `Fondo "${nuevoFondo.nombre}" creado exitosamente como tipo "${nuevoFondo.tipo}"`
            );
            this.cancelarEdicion();
            this.guardando = false;
          },
          error: (error) => {
            console.error('❌ Error creando fondo:', error);
            this.manejarErrorGuardado(error);
          }
        });
    }
  }

  private manejarErrorGuardado(error: any): void {
    this.guardando = false;
    
    let mensaje = 'Error al guardar el fondo';
    if (error.message) {
      mensaje = error.message;
    }
    
    this.notificationService.error(mensaje);
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.fondoEditando = null;
    this.fondoForm.reset();
    this.tipoSeleccionado = 'registro';
  }

  eliminarFondo(fondo: Fondo): void {
    console.log('🗑️ Iniciando eliminación de fondo en componente:', fondo);
    
    const confirmacion = confirm(`¿Está seguro de eliminar el fondo "${fondo.nombre}"?`);
    if (!confirmacion) {
      console.log('❌ Usuario canceló la eliminación de fondo');
      return;
    }

    console.log('✅ Usuario confirmó eliminación de fondo, procediendo...');

    this.fondoService.eliminarFondo(fondo._id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Fondo eliminado exitosamente en componente:', response);
          this.notificationService.success('Fondo eliminado exitosamente');
        },
        error: (error) => {
          console.error('❌ Error eliminando fondo en componente:', error);
          
          let mensaje = 'Error al eliminar el fondo';
          if (error.message) {
            mensaje = error.message;
          }
          
          this.notificationService.error(mensaje);
        }
      });
  }

  verDetalleFondo(fondo: Fondo): void {
    console.log('🔍 Abriendo detalle del fondo:', fondo);
    
    this.dialog.open(FondoDetalleModalComponent, {
      data: fondo,
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false,
      restoreFocus: false
    });
  }

  // 🆕 NUEVO: Método para crear transacción directamente en un fondo
  crearTransaccionEnFondo(fondo: Fondo): void {
    console.log('💰 Creando transacción para el fondo:', fondo.nombre);
    
    const dialogRef = this.dialog.open(TransaccionDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        transaccion: undefined, // Nueva transacción
        fondos: [fondo], // Solo el fondo seleccionado
        categorias: this.categorias,
        fondoPreseleccionado: fondo._id // Para preseleccionar el fondo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'save') {
        console.log('💾 Guardando nueva transacción para el fondo:', fondo.nombre);
        this.crearNuevaTransaccion(result.data);
      }
    });
  }

  // 🆕 NUEVO: Método para procesar la creación de transacciones
  private crearNuevaTransaccion(data: any): void {
    console.log('💾 Datos de la nueva transacción:', data);
    
    // Verificar saldo insuficiente antes de enviar al backend
    if (data.tipo === 'gasto') {
      const fondo = this.fondos.find(f => f._id === data.fondoId);
      if (fondo && fondo.saldoActual < data.monto) {
        this.notificationService.warning(
          `Advertencia: El gasto de ${data.monto.toLocaleString()} excede el saldo disponible de ${fondo.saldoActual.toLocaleString()}. El fondo quedará en saldo negativo.`
        );
      }
    }
    
    this.transaccionService.crearTransaccion(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transaccion) => {
          console.log('✅ Transacción creada exitosamente:', transaccion);
          this.notificationService.success(
            `Transacción "${transaccion.descripcion}" creada exitosamente en el fondo`
          );
          // Recargar fondos para actualizar saldos
          this.cargarFondos();
        },
        error: (error) => {
          console.error('❌ Error al crear transacción:', error);
          let mensaje = 'Error al crear la transacción';
          if (error.message) {
            mensaje = error.message;
          }
          this.notificationService.error(mensaje);
        }
      });
  }

  obtenerIconoTipo(tipo: TipoFondo): string {
    const iconos: Record<TipoFondo, string> = {
      'registro': 'assignment',
      'ahorro': 'savings',
      'prestamo': 'account_balance',
      'deuda': 'credit_card'
    };
    return iconos[tipo] || 'account_balance_wallet';
  }

  // 🔧 NUEVO MÉTODO: Nombres descriptivos para tipos
  obtenerNombreTipo(tipo: TipoFondo): string {
    const nombres: Record<TipoFondo, string> = {
      'registro': 'Control de Movimientos',
      'ahorro': 'Fondo de Ahorro',
      'prestamo': 'Préstamo - Cuentas por Cobrar',
      'deuda': 'Deuda - Cuentas por Pagar'
    };
    return nombres[tipo] || tipo;
  }

  // 🔧 MÉTODO MEJORADO: Manejo estricto de cambio de tipo
  onTipoChange(tipo: TipoFondo): void {
    console.log('🔄 Tipo de fondo cambiado a:', tipo);
    this.tipoSeleccionado = tipo;
    
    const metaControl = this.fondoForm.get('metaAhorro');
    
    if (tipo === 'registro') {
      // Para fondos de registro: BLOQUEAR completamente el campo
      metaControl?.setValue(0);
      metaControl?.disable(); // 🔧 DESHABILITADO completamente
      metaControl?.clearValidators();
      console.log('📝 Fondo de registro: Campo meta BLOQUEADO');
    } else if (tipo === 'ahorro') {
      // Para fondos de ahorro: OBLIGATORIO y habilitado
      metaControl?.enable(); // 🔧 HABILITADO
      metaControl?.setValidators([
        Validators.required, // 🔧 OBLIGATORIO
        Validators.min(1)    // 🔧 DEBE SER > 0
      ]);
      
      // Si está vacío o es 0, limpiar para mostrar placeholder
      if (!metaControl?.value || metaControl?.value <= 0) {
        metaControl?.setValue(null);
      }
      
      console.log('💰 Fondo de ahorro: Campo meta OBLIGATORIO');
    } else if (tipo === 'prestamo') {
      // Para préstamos: OBLIGATORIO (monto total del préstamo)
      metaControl?.enable();
      metaControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
      
      if (!metaControl?.value || metaControl?.value <= 0) {
        metaControl?.setValue(null);
      }
      
      console.log('💵 Préstamo: Campo meta OBLIGATORIO (monto prestado)');
    } else if (tipo === 'deuda') {
      // Para deudas: OBLIGATORIO (monto total de la deuda)
      metaControl?.enable();
      metaControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
      
      if (!metaControl?.value || metaControl?.value <= 0) {
        metaControl?.setValue(null);
      }
      
      console.log('🔴 Deuda: Campo meta OBLIGATORIO (monto que debo)');
    }
    
    metaControl?.updateValueAndValidity();
  }

  // 🔧 NUEVO MÉTODO: Clase CSS según progreso
  obtenerClaseProgreso(progreso: number): string {
    if (progreso >= 80) return 'progreso-alto';
    if (progreso >= 50) return 'progreso-medio';
    return 'progreso-bajo';
  }

  calcularProgresoMeta(fondo: Fondo): number {
    if (!fondo.metaAhorro || fondo.metaAhorro === 0) {
      return 0;
    }
    const progreso = (fondo.saldoActual / fondo.metaAhorro) * 100;
    return Math.min(Math.round(progreso), 100);
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000
    });
  }
}
