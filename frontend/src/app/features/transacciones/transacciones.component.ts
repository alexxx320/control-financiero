import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { TransaccionService } from '../../core/services/transaccion.service';
import { FiltroTransacciones } from '../../core/models/transaccion.model';
import { FondoService } from '../../core/services/fondo.service';
import { NotificationService } from '../../core/services/notification.service';
import { Transaccion, TipoTransaccion, CategoriaTransaccion } from '../../core/models/transaccion.model';
import { Fondo } from '../../core/models/fondo.model';
import { TransaccionDialogComponent } from './transaccion-dialog.component';

@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="transacciones-container">
      <!-- Filtros y acciones -->
      <mat-card class="filtros-card mb-2">
        <mat-card-header>
          <mat-card-title>Transacciones</mat-card-title>
          <div class="spacer"></div>
          <button mat-raised-button color="primary" (click)="abrirDialogoTransaccion()">
            <mat-icon>add</mat-icon>
            Nueva Transacción
          </button>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filtrosForm" class="filtros-form">
            <mat-form-field appearance="outline">
              <mat-label>Fondo</mat-label>
              <mat-select formControlName="fondoId">
                <mat-option value="">Todos los fondos</mat-option>
                <mat-option *ngFor="let fondo of fondos" [value]="fondo._id">
                  {{ fondo.nombre }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="tipo">
                <mat-option value="">Todos</mat-option>
                <mat-option value="ingreso">
                  <mat-icon class="option-icon ingreso">trending_up</mat-icon>
                  Ingreso
                </mat-option>
                <mat-option value="gasto">
                  <mat-icon class="option-icon gasto">trending_down</mat-icon>
                  Gasto
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Categoría</mat-label>
              <mat-select formControlName="categoria">
                <mat-option value="">Todas</mat-option>
                <mat-option *ngFor="let categoria of categorias" [value]="categoria">
                  {{ categoria | titlecase }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <div class="filter-actions">
              <button mat-raised-button color="accent" (click)="aplicarFiltros()">
                <mat-icon>filter_list</mat-icon>
                Filtrar
              </button>
              <button mat-button (click)="limpiarFiltros()">
                <mat-icon>clear</mat-icon>
                Limpiar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Tabla de transacciones -->
      <mat-card class="tabla-card">
        <mat-card-content>
          <!-- Loading spinner -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner [diameter]="40"></mat-spinner>
            <p>Cargando transacciones...</p>
          </div>

          <!-- Tabla -->
          <div *ngIf="!loading" class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="full-width">
              
              <ng-container matColumnDef="fecha">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Fecha </th>
                <td mat-cell *matCellDef="let transaccion"> 
                  {{ transaccion.fecha | date:'dd/MM/yyyy' }} 
                </td>
              </ng-container>

              <ng-container matColumnDef="descripcion">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Descripción </th>
                <td mat-cell *matCellDef="let transaccion"> 
                  <div class="descripcion-cell">
                    <strong>{{ transaccion.descripcion }}</strong>
                    <small *ngIf="transaccion.notas" class="notas">{{ transaccion.notas }}</small>
                    <div *ngIf="transaccion.etiquetas && transaccion.etiquetas.length > 0" class="etiquetas">
                      <span *ngFor="let etiqueta of transaccion.etiquetas" class="etiqueta-chip">
                        {{ etiqueta }}
                      </span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="fondo">
                <th mat-header-cell *matHeaderCellDef> Fondo </th>
                <td mat-cell *matCellDef="let transaccion"> 
                  {{ obtenerNombreFondo(transaccion.fondoId) }} 
                </td>
              </ng-container>

              <ng-container matColumnDef="categoria">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Categoría </th>
                <td mat-cell *matCellDef="let transaccion"> 
                  <span class="categoria-chip" 
                        [ngClass]="transaccion.tipo === 'ingreso' ? 'ingreso-chip' : 'gasto-chip'">
                    {{ transaccion.categoria | titlecase }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="tipo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Tipo </th>
                <td mat-cell *matCellDef="let transaccion"> 
                  <span class="tipo-chip" 
                        [ngClass]="transaccion.tipo === 'ingreso' ? 'ingreso-chip' : 'gasto-chip'">
                    <mat-icon>{{ transaccion.tipo === 'ingreso' ? 'trending_up' : 'trending_down' }}</mat-icon>
                    {{ transaccion.tipo | titlecase }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="monto">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Monto </th>
                <td mat-cell *matCellDef="let transaccion" 
                    [ngClass]="transaccion.tipo === 'ingreso' ? 'ingreso-text' : 'gasto-text'"> 
                  <strong>{{ (transaccion.tipo === 'ingreso' ? '+' : '-') + (transaccion.monto | currency:'COP':'symbol':'1.0-0') }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef> Acciones </th>
                <td mat-cell *matCellDef="let transaccion">
                  <button mat-icon-button color="primary" 
                          (click)="editarTransaccion(transaccion)"
                          matTooltip="Editar transacción">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" 
                          (click)="eliminarTransaccion(transaccion)"
                          matTooltip="Eliminar transacción">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  [ngClass]="{'ingreso-row': row.tipo === 'ingreso', 'gasto-row': row.tipo === 'gasto'}"></tr>
            </table>

            <!-- Mensaje cuando no hay datos -->
            <div *ngIf="dataSource.data.length === 0" class="no-data">
              <mat-icon>info</mat-icon>
              <h3>No hay transacciones</h3>
              <p>{{ filtrosAplicados ? 'No se encontraron transacciones con los filtros aplicados' : 'Crea tu primera transacción para comenzar' }}</p>
              <button mat-raised-button color="primary" (click)="abrirDialogoTransaccion()">
                <mat-icon>add</mat-icon>
                Nueva Transacción
              </button>
            </div>
          </div>

          <!-- Paginador -->
          <mat-paginator 
            *ngIf="!loading && dataSource.data.length > 0"
            [pageSizeOptions]="[10, 25, 50, 100]" 
            [pageSize]="pageSize"
            [length]="totalTransacciones"
            [showFirstLastButtons]="true"
            (page)="onPageChange($event)"
            aria-label="Seleccionar página de transacciones">
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .transacciones-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .filtros-card mat-card-header {
      display: flex;
      align-items: center;
    }

    .filtros-form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .filtros-form mat-form-field {
      min-width: 150px;
    }

    .table-container {
      overflow-x: auto;
    }

    .categoria-chip,
    .tipo-chip {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75em;
      font-weight: 500;
    }

    .ingreso-chip {
      background-color: #4caf50;
      color: white;
    }

    .gasto-chip {
      background-color: #f44336;
      color: white;
    }

    .ingreso-text {
      color: #4caf50;
      font-weight: 500;
    }

    .gasto-text {
      color: #f44336;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .transacciones-container {
        padding: 16px;
      }

      .filtros-form {
        flex-direction: column;
        align-items: stretch;
      }

      .filtros-form mat-form-field {
        min-width: auto;
      }
    }
  `]
})
export class TransaccionesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  displayedColumns: string[] = ['fecha', 'descripcion', 'fondo', 'categoria', 'tipo', 'monto', 'acciones'];
  dataSource = new MatTableDataSource<Transaccion>();
  filtrosForm: FormGroup;
  
  fondos: Fondo[] = [];
  categorias: CategoriaTransaccion[] = [];
  transacciones: Transaccion[] = [];
  totalTransacciones = 0;
  currentPage = 1;
  pageSize = 10;
  loading = false;
  filtrosAplicados = false;

  // Estadísticas
  totalIngresos = 0;
  totalGastos = 0;
  balance = 0;

  constructor(
    private fb: FormBuilder,
    private transaccionService: TransaccionService,
    private fondoService: FondoService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
    this.filtrosForm = this.fb.group({
      busqueda: [''],
      fondoId: [''],
      tipo: [''],
      categoria: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.cargarTransacciones();
    this.configurarFiltrosBusqueda();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  configurarFiltrosBusqueda(): void {
    // Auto-filtrado en tiempo real para búsqueda
    this.filtrosForm.get('busqueda')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  cargarDatosIniciales(): void {
    // Cargar fondos
    this.fondoService.obtenerFondos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fondos) => this.fondos = fondos,
        error: (error) => {
          console.error('Error al cargar fondos:', error);
          this.notificationService.error('Error al cargar fondos');
        }
      });

    // Cargar categorías
    this.categorias = this.transaccionService.obtenerCategorias();
  }

  cargarTransacciones(): void {
    this.loading = true;
    const filtros: FiltroTransacciones = this.construirFiltros();
    
    this.transaccionService.obtenerTransacciones(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.transacciones = response.transacciones;
          this.totalTransacciones = response.total;
          this.dataSource.data = this.transacciones;
          this.calcularEstadisticas();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar transacciones:', error);
          this.notificationService.error('Error al cargar transacciones');
          this.loading = false;
        }
      });
  }

  construirFiltros(): FiltroTransacciones {
    const formValues = this.filtrosForm.value;
    const filtros: FiltroTransacciones = {
      page: this.currentPage,
      limit: this.pageSize
    };
    
    // Solo agregar filtros que tengan valor
    if (formValues.busqueda) filtros.busqueda = formValues.busqueda;
    if (formValues.fondoId) filtros.fondoId = formValues.fondoId;
    if (formValues.tipo) filtros.tipo = formValues.tipo;
    if (formValues.categoria) filtros.categoria = formValues.categoria;
    
    this.filtrosAplicados = Object.keys(filtros).length > 2; // más que page y limit
    return filtros;
  }

  calcularEstadisticas(): void {
    this.totalIngresos = this.transacciones
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);
    
    this.totalGastos = this.transacciones
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.monto, 0);
    
    this.balance = this.totalIngresos - this.totalGastos;
  }

  aplicarFiltros(): void {
    this.currentPage = 1;
    this.cargarTransacciones();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.currentPage = 1;
    this.cargarTransacciones();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.cargarTransacciones();
  }

  abrirDialogoTransaccion(transaccion?: Transaccion): void {
    const dialogRef = this.dialog.open(TransaccionDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        transaccion,
        fondos: this.fondos,
        categorias: this.categorias
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'save') {
        if (transaccion) {
          this.actualizarTransaccion(transaccion._id!, result.data);
        } else {
          this.crearTransaccion(result.data);
        }
      }
    });
  }

  crearTransaccion(data: any): void {
    this.transaccionService.crearTransaccion(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Transacción creada correctamente');
          this.cargarTransacciones();
        },
        error: (error) => {
          console.error('Error al crear transacción:', error);
          this.notificationService.error('Error al crear la transacción');
        }
      });
  }

  actualizarTransaccion(id: string, data: any): void {
    this.transaccionService.actualizarTransaccion(id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Transacción actualizada correctamente');
          this.cargarTransacciones();
        },
        error: (error) => {
          console.error('Error al actualizar transacción:', error);
          this.notificationService.error('Error al actualizar la transacción');
        }
      });
  }

  editarTransaccion(transaccion: Transaccion): void {
    this.abrirDialogoTransaccion(transaccion);
  }

  eliminarTransaccion(transaccion: Transaccion): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la transacción "${transaccion.descripcion}"?`)) {
      this.transaccionService.eliminarTransaccion(transaccion._id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Transacción eliminada correctamente');
            this.cargarTransacciones();
          },
          error: (error) => {
            console.error('Error al eliminar transacción:', error);
            this.notificationService.error('Error al eliminar la transacción');
          }
        });
    }
  }

  obtenerNombreFondo(fondoId: string): string {
    const fondo = this.fondos.find(f => f._id === fondoId);
    return fondo ? fondo.nombre : 'Fondo no encontrado';
  }
}
