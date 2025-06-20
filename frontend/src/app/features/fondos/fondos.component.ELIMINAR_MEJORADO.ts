  eliminarFondo(fondo: Fondo): void {
    console.log('🗑️ Iniciando eliminación COMPLETA de fondo en componente:', fondo);
    
    // Advertencia más específica sobre eliminación completa
    const mensaje = `⚠️ ATENCIÓN: ELIMINACIÓN PERMANENTE ⚠️

¿Está completamente seguro de eliminar el fondo "${fondo.nombre}"?

Esta acción:
✅ Eliminará el fondo permanentemente de la base de datos
✅ Eliminará TODAS las transacciones asociadas a este fondo
❌ NO se puede deshacer

¿Desea continuar con la eliminación COMPLETA?`;

    const confirmacion = confirm(mensaje);
    if (!confirmacion) {
      console.log('❌ Usuario canceló la eliminación completa');
      this.notificationService.info('Eliminación cancelada por el usuario');
      return;
    }

    console.log('✅ Usuario confirmó eliminación COMPLETA, procediendo...');
    
    // Mostrar notificación de que se está procesando
    this.notificationService.info('Eliminando fondo y todas sus transacciones...');

    this.fondoService.eliminarFondo(fondo._id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Fondo eliminado COMPLETAMENTE en componente:', response);
          this.notificationService.success('Fondo y todas sus transacciones eliminadas permanentemente de la base de datos');
        },
        error: (error) => {
          console.error('❌ Error eliminando fondo COMPLETAMENTE en componente:', error);
          
          let mensaje = 'Error al eliminar el fondo completamente';
          if (error.message) {
            mensaje = error.message;
          }
          
          this.notificationService.error(mensaje);
        }
      });
  }