  /**
   * Obtiene el texto apropiado para el progreso
   */
  obtenerTextoProgreso(fondo: Fondo): string {
    if (fondo.tipo === 'prestamo') {
      return 'Progreso de cobro';
    } else {
      return 'Progreso hacia la meta';
    }
  }

  /**
   * Calcula la meta según el tipo de fondo
   */
  private calcularMetaSegunTipo(fondoData: any): number {
    if (fondoData.tipo === 'ahorro') {
      return fondoData.metaAhorro || 0;
    } else if (fondoData.tipo === 'prestamo') {
      // Para préstamos, la meta es el monto prestado
      return fondoData.saldoActual || 0;
    } else {
      // Para registros, no hay meta
      return 0;
    }
  }
}
