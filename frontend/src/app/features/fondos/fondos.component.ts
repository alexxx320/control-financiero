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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FondoService } from '../../core/services/fondo.service';
import { Fondo, TipoFondo, CreateFondoDto, UpdateFondoDto, PrestamoUtils, ProgresoPrestamo, DeudaUtils } from '../../core/models/fondo.model';
import { FondoDetalleModalComponent } from '../../shared/components/fondo-detalle-modal.component';
import { NotificationService } from '../../core/services/notification.service';
import { TransaccionDialogComponent } from '../transacciones/transaccion-dialog.component';
import { TransaccionService } from '../../core/services/transaccion.service';
import { CategoriaTransaccion } from '../../core/models/transaccion.model';
import { NumberFormatDirective } from '../../shared/directives/number-format.directive';

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
    MatTooltipModule,
    MatCheckboxModule,
    NumberFormatDirective
  ],
  templateUrl: './fondos.component.html',
  styleUrls: ['./fondos.component.scss']
})
export class FondosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  fondos: Fondo[] = [];
  tiposFondo: TipoFondo[] = [];
  fondoForm: FormGroup;
  mostrarFormulario = false;
  fondoEditando: Fondo | null = null;
  guardando = false;
  tipoSeleccionado: TipoFondo = 'registro';
  
  PrestamoUtils = PrestamoUtils;
  DeudaUtils = DeudaUtils;
  categorias: CategoriaTransaccion[] = [];

  // Variables para el filtro de fondos
  mostrarInactivos = false;
  totalFondos = 0;
  fondosActivos = 0;
  fondosInactivos = 0;

  // Variables para el filtro por tipo
  todosFondos: Fondo[] = [];
  fondosFiltrados: Fondo[] = [];
  tiposFondoSeleccionados: TipoFondo[] = [];

  constructor(
    private fb: FormBuilder,
    private fondoService: FondoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private transaccionService: TransaccionService
  ) {
    this.fondoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      tipo: ['registro', Validators.required],
      saldoActual: [0, [Validators.required, Validators.min(0)]],
      metaAhorro: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.cargarTiposFondo();
    this.tiposFondoSeleccionados = [...this.tiposFondo];
    this.cargarFondos();
    this.categorias = this.transaccionService.obtenerCategorias();
    
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
    this.fondoService.obtenerFondos(undefined, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (todosFondos) => {
          this.todosFondos = todosFondos;
          this.actualizarContadoresConTodos(todosFondos);
          this.aplicarFiltros();
        },
        error: (error) => {
          console.error('❌ Error cargando fondos:', error);
          this.notificationService.error('Error al cargar fondos');
          this.todosFondos = [];
          this.fondosFiltrados = [];
          this.actualizarContadores();
        }
      });
    
    this.fondoService.fondos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(fondos => {
        this.todosFondos = fondos;
        this.aplicarFiltros();
        this.actualizarContadores();
      });
  }

  private actualizarContadoresConTodos(todosFondos: Fondo[]): void {
    this.totalFondos = todosFondos.length;
    this.fondosActivos = todosFondos.filter(f => f.activo).length;
    this.fondosInactivos = todosFondos.filter(f => !f.activo).length;
  }

  private actualizarContadores(): void {
    this.totalFondos = this.todosFondos.length;
    this.fondosActivos = this.todosFondos.filter(f => f.activo).length;
    this.fondosInactivos = this.todosFondos.filter(f => !f.activo).length;
  }

  toggleMostrarInactivos(): void {
    this.mostrarInactivos = !this.mostrarInactivos;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let fondosFiltrados = [...this.todosFondos];
    
    if (!this.mostrarInactivos) {
      fondosFiltrados = fondosFiltrados.filter(f => f.activo);
    }
    
    if (this.tiposFondoSeleccionados.length > 0 && this.tiposFondoSeleccionados.length < this.tiposFondo.length) {
      fondosFiltrados = fondosFiltrados.filter(f => this.tiposFondoSeleccionados.includes(f.tipo));
    }
    
    this.fondosFiltrados = fondosFiltrados;
  }

  toggleTipoFondo(tipo: TipoFondo, seleccionado: boolean): void {
    if (seleccionado) {
      if (!this.tiposFondoSeleccionados.includes(tipo)) {
        this.tiposFondoSeleccionados.push(tipo);
      }
    } else {
      this.tiposFondoSeleccionados = this.tiposFondoSeleccionados.filter(t => t !== tipo);
    }
    this.aplicarFiltros();
  }

  esTipoSeleccionado(tipo: TipoFondo): boolean {
    return this.tiposFondoSeleccionados.includes(tipo);
  }

  seleccionarTodosTipos(): void {
    this.tiposFondoSeleccionados = [...this.tiposFondo];
    this.aplicarFiltros();
  }

  limpiarFiltroTipos(): void {
    this.tiposFondoSeleccionados = [];
    this.aplicarFiltros();
  }

  hayFiltrosActivos(): boolean {
    return this.tiposFondoSeleccionados.length > 0 && this.tiposFondoSeleccionados.length < this.tiposFondo.length;
  }

  contarFondosPorTipo(tipo: TipoFondo): number {
    const fondosDelTipo = this.todosFondos.filter(f => f.tipo === tipo);
    if (!this.mostrarInactivos) {
      return fondosDelTipo.filter(f => f.activo).length;
    }
    return fondosDelTipo.length;
  }

  obtenerNombreTipoCorto(tipo: TipoFondo): string {
    const nombres: Record<TipoFondo, string> = {
      'registro': 'Registro',
      'ahorro': 'Ahorro',
      'prestamo': 'Préstamo',
      'deuda': 'Deuda'
    };
    return nombres[tipo] || tipo;
  }

  abrirDialogoFondo(): void {
    this.mostrarFormulario = true;
    this.fondoEditando = null;
    this.fondoForm.reset({
      tipo: 'registro',
      saldoActual: 0,
      metaAhorro: 0
    });
    this.tipoSeleccionado = 'registro';
    this.fondoForm.get('saldoActual')?.enable();
    this.onTipoChange('registro');
  }

  editarFondo(fondo: Fondo): void {
    this.mostrarFormulario = true;
    this.fondoEditando = fondo;
    this.tipoSeleccionado = fondo.tipo;
    
    this.fondoForm.patchValue({
      nombre: fondo.nombre,
      descripcion: fondo.descripcion || '',
      tipo: fondo.tipo,
      saldoActual: (PrestamoUtils.esPrestamo(fondo) || DeudaUtils.esDeuda(fondo)) ? Math.abs(fondo.saldoActual) : (fondo.saldoActual || 0),
      metaAhorro: fondo.metaAhorro || 0
    });
    
    this.fondoForm.get('saldoActual')?.disable();
    this.onTipoChange(fondo.tipo);
  }

  guardarFondo(): void {
    if (this.fondoForm.invalid || this.guardando) return;

    this.guardando = true;
    const fondoData = this.fondoForm.value;

    if (this.fondoEditando) {
      const updateData: UpdateFondoDto = {
        nombre: fondoData.nombre,
        descripcion: fondoData.descripcion,
        tipo: fondoData.tipo,
        metaAhorro: (fondoData.tipo === 'ahorro' || fondoData.tipo === 'prestamo' || fondoData.tipo === 'deuda') ? (fondoData.metaAhorro || 0) : 0
      };

      this.fondoService.actualizarFondo(this.fondoEditando._id!, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (fondoActualizado) => {
            this.notificationService.success('Fondo actualizado. Nota: El saldo solo se modifica mediante transacciones.');
            this.cancelarEdicion();
            this.guardando = false;
          },
          error: (error) => {
            this.manejarErrorGuardado(error);
          }
        });
    } else {
      const createData: CreateFondoDto = {
        nombre: fondoData.nombre,
        descripcion: fondoData.descripcion,
        tipo: fondoData.tipo,
        saldoActual: fondoData.saldoActual || 0,
        metaAhorro: (fondoData.tipo === 'ahorro' || fondoData.tipo === 'prestamo' || fondoData.tipo === 'deuda') ? (fondoData.metaAhorro || 0) : 0
      };

      if (fondoData.tipo === 'prestamo') {
        if (createData.saldoActual! > 0) {
          createData.saldoActual = -Math.abs(createData.saldoActual!);
        }
      } else if (fondoData.tipo === 'deuda') {
        if (createData.saldoActual! > 0) {
          createData.saldoActual = -Math.abs(createData.saldoActual!);
        }
      }

      this.fondoService.crearFondo(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (nuevoFondo) => {
            this.notificationService.success(`Fondo "${nuevoFondo.nombre}" creado exitosamente como tipo "${nuevoFondo.tipo}"`);
            this.cancelarEdicion();
            this.guardando = false;
          },
          error: (error) => {
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
    const confirmacion = confirm(`¿Está seguro de eliminar el fondo "${fondo.nombre}"?`);
    if (!confirmacion) {
      return;
    }

    this.fondoService.eliminarFondo(fondo._id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.notificationService.success('Fondo eliminado exitosamente');
        },
        error: (error) => {
          let mensaje = 'Error al eliminar el fondo';
          if (error.message) {
            mensaje = error.message;
          }
          this.notificationService.error(mensaje);
        }
      });
  }

  verDetalleFondo(fondo: Fondo): void {
    this.dialog.open(FondoDetalleModalComponent, {
      data: fondo,
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false,
      restoreFocus: false
    });
  }

  crearTransaccionEnFondo(fondo: Fondo): void {
    const dialogRef = this.dialog.open(TransaccionDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        transaccion: undefined,
        fondos: [fondo],
        categorias: this.categorias,
        fondoPreseleccionado: fondo._id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'save') {
        this.crearNuevaTransaccion(result.data);
      }
    });
  }

  private crearNuevaTransaccion(data: any): void {
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
          this.notificationService.success(`Transacción "${transaccion.descripcion}" creada exitosamente en el fondo`);
          this.cargarFondos();
        },
        error: (error) => {
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

  obtenerNombreTipo(tipo: TipoFondo): string {
    const nombres: Record<TipoFondo, string> = {
      'registro': 'Control de Movimientos',
      'ahorro': 'Fondo de Ahorro',
      'prestamo': 'Préstamo - Cuentas por Cobrar',
      'deuda': 'Deuda - Cuentas por Pagar'
    };
    return nombres[tipo] || tipo;
  }

  onTipoChange(tipo: TipoFondo): void {
    this.tipoSeleccionado = tipo;
    const metaControl = this.fondoForm.get('metaAhorro');
    
    if (tipo === 'registro') {
      metaControl?.setValue(0);
      metaControl?.disable();
      metaControl?.clearValidators();
    } else if (tipo === 'ahorro') {
      metaControl?.enable();
      metaControl?.setValidators([Validators.required, Validators.min(1)]);
      if (!metaControl?.value || metaControl?.value <= 0) {
        metaControl?.setValue(null);
      }
    } else if (tipo === 'prestamo') {
      metaControl?.enable();
      metaControl?.setValidators([Validators.required, Validators.min(1)]);
      if (!metaControl?.value || metaControl?.value <= 0) {
        metaControl?.setValue(null);
      }
    } else if (tipo === 'deuda') {
      metaControl?.enable();
      metaControl?.setValidators([Validators.required, Validators.min(1)]);
      if (!metaControl?.value || metaControl?.value <= 0) {
        metaControl?.setValue(null);
      }
    }
    
    metaControl?.updateValueAndValidity();
  }

  obtenerClaseProgreso(progreso: number): string {
    if (progreso >= 80) return 'alto';
    if (progreso >= 50) return 'medio';
    return 'bajo';
  }

  calcularProgresoMeta(fondo: Fondo): number {
    if (!fondo.metaAhorro || fondo.metaAhorro === 0) {
      return 0;
    }
    const progreso = (fondo.saldoActual / fondo.metaAhorro) * 100;
    return Math.min(Math.round(progreso), 100);
  }

  toggleEstadoFondo(fondo: Fondo): void {
    const accion = fondo.activo ? 'desactivar' : 'activar';
    const confirmacion = confirm(`¿Está seguro de ${accion} el fondo "${fondo.nombre}"?`);
    
    if (!confirmacion) {
      return;
    }
    
    this.fondoService.toggleEstadoFondo(fondo._id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.notificationService.success(response.message);
          this.cargarFondos();
          
          if (!response.fondo.activo && !this.mostrarInactivos) {
            setTimeout(() => {
              const mostrar = confirm(
                `El fondo "${response.fondo.nombre}" ha sido desactivado.\n\n` +
                `¿Desea mostrar los fondos inactivos para poder gestionarlos?`
              );
              if (mostrar) {
                this.mostrarInactivos = true;
                this.cargarFondos();
              }
            }, 1000);
          }
        },
        error: (error) => {
          let mensaje = 'Error al cambiar el estado del fondo';
          if (error.message) {
            mensaje = error.message;
          }
          this.notificationService.error(mensaje);
        }
      });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000
    });
  }
}
