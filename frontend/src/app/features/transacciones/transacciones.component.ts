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
import { CategoriaUtils } from '../../shared/utils/categoria.utils';
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
                <mat-option *ngFor="let categoria of obtenerCategoriasFiltradas()" [value]="categoria">
                  {{ formatearCategoria(categoria) }}
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
              
              <!-- Botón de debug -->
              <button mat-stroked-button color="warn" (click)="debugFiltros()" *ngIf="false">
                <mat-icon>bug_report</mat-icon>
                Debug
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
                  {{ obtenerNombreFondo(transaccion) }} 
                </td>
              </ng-container>

              <ng-container matColumnDef="categoria">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Categoría </th>
                <td mat-cell *matCellDef="let transaccion"> 
                  <span class="categoria-chip" 
                        [ngClass]="transaccion.tipo === 'ingreso' ? 'ingreso-chip' : 'gasto-chip'">
                    {{ formatearCategoria(transaccion.categoria) }}
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
            [pageIndex]="currentPage - 1"
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
    console.log('🚀 Iniciando componente de transacciones...');
    this.cargarDatosIniciales();
    this.configurarFiltrosBusqueda();
    // Cargar transacciones DESPUÉS de cargar fondos
    setTimeout(() => this.cargarTransacciones(), 1000);
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
      
    // Cuando cambie el tipo, limpiar la categoría y actualizar opciones
    this.filtrosForm.get('tipo')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filtrosForm.get('categoria')?.setValue('');
      });
      
    // Cuando cambie el fondo, aplicar filtro automáticamente
    this.filtrosForm.get('fondoId')?.valueChanges
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe((fondoId) => {
        console.log('🏦 Fondo seleccionado cambiado a:', fondoId);
        this.aplicarFiltros();
      });
      
    // Cuando cambie la categoría, aplicar filtro automáticamente
    this.filtrosForm.get('categoria')?.valueChanges
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe((categoria) => {
        console.log('🏷️ Categoría seleccionada cambiada a:', categoria);
        this.aplicarFiltros();
      });
      
    // Cuando cambie el tipo, aplicar filtro automáticamente
    this.filtrosForm.get('tipo')?.valueChanges
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe((tipo) => {
        console.log('📋 Tipo seleccionado cambiado a:', tipo);
        // Limpiar categoría si ya había una seleccionada
        this.filtrosForm.get('categoria')?.setValue('', { emitEvent: false });
        this.aplicarFiltros();
      });
  }

  cargarDatosIniciales(): void {
    console.log('🏦 Cargando fondos para transacciones...');
    
    // Primero intentar cargar fondos directamente
    this.fondoService.obtenerFondos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fondos) => {
          console.log('✅ Fondos cargados directamente:', fondos);
          this.fondos = fondos;
          
          // Cargar transacciones una vez que tengamos los fondos
          if (fondos.length > 0) {
            console.log('📄 Cargando transacciones ahora que tenemos fondos...');
            this.cargarTransacciones();
          }
        },
        error: (error) => {
          console.error('❌ Error al cargar fondos directamente:', error);
          this.notificationService.error('Error al cargar fondos');
        }
      });
      
    // También suscribirse a cambios en tiempo real
    this.fondoService.fondos$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fondos) => {
          if (fondos.length > 0) {
            console.log('✅ Fondos actualizados desde observable:', fondos);
            this.fondos = fondos;
          }
        },
        error: (error) => {
          console.error('❌ Error en observable de fondos:', error);
        }
      });

    // Cargar categorías
    this.categorias = this.transaccionService.obtenerCategorias();
    console.log('🏷️ Categorías disponibles:', this.categorias);
  }

  cargarTransacciones(): void {
    console.log('📄 Cargando transacciones... Fondos disponibles:', this.fondos.length);
    
    if (this.fondos.length === 0) {
      console.log('⚠️ No hay fondos cargados aún, reintentando en 500ms...');
      setTimeout(() => this.cargarTransacciones(), 500);
      return;
    }
    
    this.loading = true;
    const filtros: FiltroTransacciones = this.construirFiltros();
    
    this.transaccionService.obtenerTransacciones(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta de transacciones:', response);
          this.transacciones = response.transacciones;
          this.totalTransacciones = response.total;
          this.dataSource.data = this.transacciones;
          this.calcularEstadisticas();
          this.loading = false;
          
          // Debug: mostrar información de fondos por transacción
          this.transacciones.forEach(t => {
            console.log(`Transacción "${t.descripcion}" tiene fondoId: ${t.fondoId}`);
            const fondo = this.fondos.find(f => f._id === t.fondoId);
            console.log(`Fondo encontrado:`, fondo ? fondo.nombre : 'NO ENCONTRADO');
          });
        },
        error: (error) => {
          console.error('❌ Error al cargar transacciones:', error);
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
    if (formValues.fondoId) {
      filtros.fondoId = formValues.fondoId;
      console.log('🔍 Filtro por fondo aplicado:', formValues.fondoId);
    }
    if (formValues.tipo) filtros.tipo = formValues.tipo;
    if (formValues.categoria) filtros.categoria = formValues.categoria;
    
    console.log('📋 Filtros construidos:', filtros);
    
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
    console.log('📄 Cambio de página:', event);
    this.currentPage = event.pageIndex + 1; // pageIndex es 0-based
    this.pageSize = event.pageSize;
    this.cargarTransacciones();
  }

  abrirDialogoTransaccion(transaccion?: Transaccion): void {
    // Verificar que existan fondos antes de crear transacciones
    if (this.fondos.length === 0) {
      this.notificationService.warning('Debe crear al menos un fondo antes de realizar transacciones.');
      return;
    }
    
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
    // Verificar saldo insuficiente antes de enviar al backend
    if (data.tipo === 'gasto') {
      const fondo = this.fondos.find(f => f._id === data.fondoId);
      if (fondo && fondo.saldoActual < data.monto) {
        this.notificationService.warning(`Advertencia: El gasto de ${data.monto.toLocaleString()} excede el saldo disponible de ${fondo.saldoActual.toLocaleString()}. El fondo quedará en saldo negativo.`);
      }
    }
    
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
    console.log('🔄 Iniciando actualización de transacción en componente:', { id, data });
    
    this.transaccionService.actualizarTransaccion(id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Transacción actualizada exitosamente en componente:', response);
          this.notificationService.success('Transacción actualizada correctamente');
          this.cargarTransacciones();
        },
        error: (error) => {
          console.error('❌ Error al actualizar transacción en componente:', error);
          this.notificationService.error('Error al actualizar la transacción');
        }
      });
  }

  editarTransaccion(transaccion: Transaccion): void {
    this.abrirDialogoTransaccion(transaccion);
  }

  eliminarTransaccion(transaccion: Transaccion): void {
    console.log('🗑️ Iniciando eliminación de transacción en componente:', transaccion);
    
    if (confirm(`¿Estás seguro de que deseas eliminar la transacción "${transaccion.descripcion}"?`)) {
      console.log('✅ Usuario confirmó eliminación, procediendo...');
      
      this.transaccionService.eliminarTransaccion(transaccion._id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Transacción eliminada exitosamente en componente:', response);
            this.notificationService.success('Transacción eliminada correctamente');
            this.cargarTransacciones();
          },
          error: (error) => {
            console.error('❌ Error al eliminar transacción en componente:', error);
            this.notificationService.error('Error al eliminar la transacción');
          }
        });
    } else {
      console.log('❌ Usuario canceló la eliminación');
    }
  }

  obtenerNombreFondo(transaccion: Transaccion): string {
    // Si la transacción tiene el nombre del fondo ya cargado, usarlo
    if (transaccion._fondoNombre) {
      return transaccion._fondoNombre;
    }
    
    // Si no hay fondos cargados, intentar cargarlos
    if (this.fondos.length === 0) {
      this.cargarFondosSincrono();
      return 'Cargando...';
    }
    
    // Buscar el fondo por ID
    const fondo = this.fondos.find(f => f._id === transaccion.fondoId);
    return fondo ? fondo.nombre : `ID: ${transaccion.fondoId.substring(0, 8)}...`;
  }
  
  formatearCategoria(categoria: string): string {
    return CategoriaUtils.formatearCategoria(categoria);
  }

  obtenerCategoriasFiltradas(): CategoriaTransaccion[] {
    const tipoSeleccionado = this.filtrosForm.get('tipo')?.value;
    if (tipoSeleccionado) {
      return this.transaccionService.obtenerCategoriasPorTipo(tipoSeleccionado);
    }
    return this.categorias;
  }

  debugFiltros(): void {
    console.log('🔍 === DEBUG FILTROS ===');
    console.log('📋 Valores del formulario:', this.filtrosForm.value);
    console.log('🏦 Fondos disponibles:', this.fondos.map(f => ({ id: f._id, nombre: f.nombre })));
    console.log('🏷️ Categorías disponibles:', this.categorias);
    
    const filtros = this.construirFiltros();
    console.log('🔧 Filtros construidos:', filtros);
    
    console.log('🎯 Filtros aplicados:', this.filtrosAplicados);
    console.log('📊 Total transacciones:', this.totalTransacciones);
    console.log('📄 Transacciones actuales:', this.transacciones.length);
    
    if (this.transacciones.length > 0) {
      console.log('🔍 Primeras 3 transacciones:', this.transacciones.slice(0, 3).map(t => ({
        desc: t.descripcion,
        fondoId: t.fondoId,
        tipo: t.tipo,
        categoria: t.categoria
      })));
    }
    console.log('🔍 === FIN DEBUG ===');
  }

  private cargarFondosSincrono(): void {
    // Intentar cargar desde cache primero
    const cache = localStorage.getItem('fondos_cache');
    if (cache) {
      try {
        this.fondos = JSON.parse(cache);
        return;
      } catch (e) {
        console.warn('Error parseando cache de fondos');
      }
    }
    
    // Si no hay cache, hacer petición
    this.fondoService.obtenerFondos().subscribe({
      next: (fondos) => {
        this.fondos = fondos;
      },
      error: (error) => {
        console.error('Error cargando fondos para obtenerNombreFondo:', error);
      }
    });
  }
}
