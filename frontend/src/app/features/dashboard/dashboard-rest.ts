  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    const fechaInicio = filtros.fechaInicio ? filtros.fechaInicio.toISOString().split('T')[0] : undefined;
    const fechaFin = filtros.fechaFin ? filtros.fechaFin.toISOString().split('T')[0] : undefined;

    this.dashboardService.obtenerResumenFinanciero(fechaInicio, fechaFin)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resumen) => {
          this.resumenFinanciero = resumen;
          this.actualizarGraficos();
        },
        error: (error) => console.error('Error al aplicar filtros:', error)
      });
  }

  private actualizarGraficos(): void {
    if (!this.resumenFinanciero) return;

    // Actualizar gráfico de ingresos vs gastos
    this.ingresosGastosData.datasets[0].data = [
      this.resumenFinanciero.totalIngresos,
      this.resumenFinanciero.totalGastos
    ];

    // Actualizar gráfico de categorías
    const categorias = this.resumenFinanciero.transaccionesPorCategoria
      .filter(cat => cat.tipo === 'gasto')
      .slice(0, 10); // Mostrar solo las 10 principales

    this.categoriesData.labels = categorias.map(cat => cat.categoria);
    this.categoriesData.datasets[0].data = categorias.map(cat => cat.monto);
  }

  calcularProgreso(fondo: Fondo): number {
    // Aquí deberías obtener el balance actual del fondo
    // Por ahora retornamos un valor aleatorio para demostración
    return Math.floor(Math.random() * 100);
  }
}
