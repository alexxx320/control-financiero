          this.notificationService.error(mensaje);
          this.fondos = [];
        }
      });
    
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
      saldoActual: fondo.saldoActual || 0,
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
        metaAhorro: this.calcularMetaSegunTipo(fondoData)
      };

      this.fondoService.actualizarFondo(this.fondoEditando._id!, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Fondo actualizado exitosamente.');
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
        metaAhorro: this.calcularMetaSegunTipo(fondoData)
      };

      this.fondoService.crearFondo(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (nuevoFondo) => {
            this.notificationService.success(
              `Fondo "${nuevoFondo.nombre}" creado exitosamente como tipo "${nuevoFondo.tipo}"`
            );
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
    if (!confirmacion) return;

    this.fondoService.eliminarFondo(fondo._id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
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
          `Advertencia: El gasto excede el saldo disponible. El fondo quedará en saldo negativo.`
        );
      }
    }
    
    this.transaccionService.crearTransaccion(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transaccion) => {
          this.notificationService.success(
            `Transacción "${transaccion.descripcion}" creada exitosamente`
          );
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
      'prestamo': 'handshake'
    };
    return iconos[tipo] || 'account_balance_wallet';
  }

  onTipoChange(tipo: TipoFondo): void {
    this.tipoSeleccionado = tipo;
    
    const metaControl = this.fondoForm.get('metaAhorro');
    const saldoControl = this.fondoForm.get('saldoActual');
    
    if (tipo === 'registro') {
      metaControl?.setValue(0);
      metaControl?.disable();
      metaControl?.clearValidators();
    } else if (tipo === 'ahorro') {
      metaControl?.enable();
      metaControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
      
      if (!metaControl?.value || metaControl?.value <= 0) {
        metaControl?.setValue(null);
      }
    } else if (tipo === 'prestamo') {
      metaControl?.disable();
      metaControl?.clearValidators();
      
      saldoControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
    }
    
    metaControl?.updateValueAndValidity();
    saldoControl?.updateValueAndValidity();
  }

  calcularProgresoMeta(fondo: Fondo): number {
    if (!fondo.metaAhorro || fondo.metaAhorro === 0) {
      return 0;
    }
    
    let progreso: number;
    
    if (fondo.tipo === 'prestamo') {
      const montoCobrado = fondo.metaAhorro - fondo.saldoActual;
      progreso = (montoCobrado / fondo.metaAhorro) * 100;
    } else {
      progreso = (fondo.saldoActual / fondo.metaAhorro) * 100;
    }
    
    return Math.min(Math.max(Math.round(progreso), 0), 100);
  }

  obtenerEtiquetaSaldo(fondo: Fondo): string {
    if (fondo.tipo === 'prestamo') {
      return 'Cuentas por Cobrar:';
    } else if (fondo.saldoActual >= 0) {
      return 'Saldo Actual:';
    } else {
      return 'Deuda Actual:';
    }
  }

  obtenerClaseSaldo(fondo: Fondo): string {
    if (fondo.tipo === 'prestamo') {
      return fondo.saldoActual > 0 ? 'saldo-prestamo' : 'saldo-cobrado';
    } else {
      return fondo.saldoActual >= 0 ? 'saldo-positivo' : 'saldo-negativo';
    }
  }

  obtenerValorSaldo(fondo: Fondo): number {
    if (fondo.tipo === 'prestamo') {
      return fondo.saldoActual;
    } else {
      return fondo.saldoActual >= 0 ? fondo.saldoActual : -fondo.saldoActual;
    }
  }

  debeMostrarProgreso(fondo: Fondo): boolean {
    if (fondo.tipo === 'prestamo') {
      return fondo.metaAhorro && fondo.metaAhorro > 0;
    } else {
      return fondo.metaAhorro && fondo.metaAhorro > 0 && fondo.saldoActual > 0;
    }
  }

  obtenerTextoProgreso(fondo: Fondo): string {
    if (fondo.tipo === 'prestamo') {
      return 'Progreso de cobro';
    } else {
      return 'Progreso hacia la meta';
    }
  }

  private calcularMetaSegunTipo(fondoData: any): number {
    if (fondoData.tipo === 'ahorro') {
      return fondoData.metaAhorro || 0;
    } else if (fondoData.tipo === 'prestamo') {
      return fondoData.saldoActual || 0;
    } else {
      return 0;
    }
  }
}
