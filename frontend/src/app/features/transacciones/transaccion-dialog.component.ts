import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { Transaccion, TipoTransaccion, CategoriaTransaccion } from '../../core/models/transaccion.model';
import { TransaccionService } from '../../core/services/transaccion.service';
import { Fondo } from '../../core/models/fondo.model';
import { CategoriaUtils } from '../../shared/utils/categoria.utils';

export interface TransaccionDialogData {
  transaccion?: Transaccion;
  fondos: Fondo[];
  categorias: CategoriaTransaccion[];
  fondoPreseleccionado?: string; // 🆕 NUEVO: Para preseleccionar un fondo
}

@Component({
  selector: 'app-transaccion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.transaccion ? 'edit' : 'add' }}</mat-icon>
      {{ data.transaccion ? 'Editar' : 'Nueva' }} Transacción
    </h2>

    <mat-dialog-content>
      <form [formGroup]="transaccionForm" class="transaccion-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Fondo</mat-label>
            <mat-select formControlName="fondoId">
              <mat-option *ngFor="let fondo of data.fondos" [value]="fondo._id">
                {{ fondo.nombre }} ({{ fondo.tipo | titlecase }})
                <!-- 🆕 MOSTRAR SALDO ACTUAL DEL FONDO -->
                <span class="fondo-saldo"> - Saldo: {{ fondo.saldoActual | currency:'COP':'symbol':'1.0-0' }}</span>
              </mat-option>
            </mat-select>
            <mat-error *ngIf="transaccionForm.get('fondoId')?.hasError('required')">
              Selecciona un fondo
            </mat-error>
            <!-- 🆕 MOSTRAR AVISO SI ES DESDE UN FONDO ESPECÍFICO -->
            <mat-hint *ngIf="data.fondoPreseleccionado">
              Creando transacción para: {{ obtenerNombreFondoPreseleccionado() }}
            </mat-hint>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="tipo" (selectionChange)="onTipoChange()">
              <mat-option value="ingreso">
                <mat-icon class="option-icon ingreso">trending_up</mat-icon>
                Ingreso
              </mat-option>
              <mat-option value="gasto">
                <mat-icon class="option-icon gasto">trending_down</mat-icon>
                Gasto
              </mat-option>
            </mat-select>
            <mat-error *ngIf="transaccionForm.get('tipo')?.hasError('required')">
              Selecciona el tipo
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="categoria">
              <mat-option *ngFor="let categoria of categoriasFiltradasPorTipo" [value]="categoria">
                {{ formatearCategoria(categoria) }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="transaccionForm.get('categoria')?.hasError('required')">
              Selecciona una categoría
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descripción</mat-label>
            <input matInput formControlName="descripcion" placeholder="Ej: Compra en supermercado">
            <mat-error *ngIf="transaccionForm.get('descripcion')?.hasError('required')">
              La descripción es requerida
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Monto</mat-label>
            <input matInput type="number" formControlName="monto" placeholder="0" min="0.01" step="0.01">
            <span matTextPrefix>$</span>
            <mat-error *ngIf="transaccionForm.get('monto')?.hasError('required')">
              El monto es requerido
            </mat-error>
            <mat-error *ngIf="transaccionForm.get('monto')?.hasError('min')">
              El monto debe ser mayor a 0
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Fecha</mat-label>
            <input matInput [matDatepicker]="fechaPicker" formControlName="fecha">
            <mat-datepicker-toggle matIconSuffix [for]="fechaPicker"></mat-datepicker-toggle>
            <mat-datepicker #fechaPicker></mat-datepicker>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="transaccionForm.invalid || guardando"
              (click)="onSave()">
        {{ guardando ? 'Guardando...' : (data.transaccion ? 'Actualizar' : 'Crear') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .transaccion-form {
      min-width: 500px;
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

    .option-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    .option-icon.ingreso {
      color: #4caf50;
    }

    .option-icon.gasto {
      color: #f44336;
    }

    .fondo-saldo {
      font-size: 0.8em;
      color: rgba(0,0,0,0.6);
      font-style: italic;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .transaccion-form {
        min-width: 280px;
        max-width: 100%;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class TransaccionDialogComponent implements OnInit {
  transaccionForm: FormGroup;
  guardando = false;
  categoriasFiltradasPorTipo: CategoriaTransaccion[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TransaccionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TransaccionDialogData,
    private transaccionService: TransaccionService
  ) {
    this.transaccionForm = this.fb.group({
      fondoId: ['', Validators.required],
      tipo: ['', Validators.required],
      categoria: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      monto: [0, [Validators.required, Validators.min(0.01)]],
      fecha: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    // Si estamos editando, cargar los datos
    if (this.data.transaccion) {
      this.transaccionForm.patchValue({
        fondoId: this.data.transaccion.fondoId,
        tipo: this.data.transaccion.tipo,
        categoria: this.data.transaccion.categoria,
        descripcion: this.data.transaccion.descripcion,
        monto: this.data.transaccion.monto,
        fecha: this.data.transaccion.fecha ? new Date(this.data.transaccion.fecha) : new Date()
      });

      // Filtrar categorías según el tipo
      this.onTipoChange();
    } else if (this.data.fondoPreseleccionado) {
      // 🆕 NUEVO: Si hay un fondo preseleccionado, configurarlo
      this.transaccionForm.patchValue({
        fondoId: this.data.fondoPreseleccionado
      });
      console.log('💰 Fondo preseleccionado:', this.data.fondoPreseleccionado);
    }
  }

  onTipoChange(): void {
    const tipo = this.transaccionForm.get('tipo')?.value as TipoTransaccion;
    
    if (tipo) {
      this.categoriasFiltradasPorTipo = this.transaccionService.obtenerCategoriasPorTipo(tipo);
    } else {
      this.categoriasFiltradasPorTipo = [];
    }

    // Limpiar categoría si no es válida para el nuevo tipo
    const categoriaActual = this.transaccionForm.get('categoria')?.value;
    if (categoriaActual && !this.categoriasFiltradasPorTipo.includes(categoriaActual)) {
      this.transaccionForm.patchValue({ categoria: '' });
    }
  }

  formatearCategoria(categoria: string): string {
    return CategoriaUtils.formatearCategoria(categoria);
  }

  // 🆕 NUEVO: Obtener nombre del fondo preseleccionado
  obtenerNombreFondoPreseleccionado(): string {
    if (!this.data.fondoPreseleccionado) return '';
    const fondo = this.data.fondos.find(f => f._id === this.data.fondoPreseleccionado);
    return fondo ? fondo.nombre : 'Fondo no encontrado';
  }

  onSave(): void {
    if (this.transaccionForm.invalid) return;

    this.guardando = true;
    const formData = this.transaccionForm.value;
    
    // Procesar datos de la transacción
    const transaccionData = {
      fondoId: formData.fondoId,
      tipo: formData.tipo,
      categoria: formData.categoria,
      descripcion: formData.descripcion,
      monto: Number(formData.monto),
      fecha: formData.fecha
    };

    this.dialogRef.close({ action: 'save', data: transaccionData });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }
}
