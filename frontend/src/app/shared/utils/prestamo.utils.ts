import { Fondo } from '../../core/models/fondo.model';

/**
 * Utilidades para manejar fondos de tipo préstamo
 */
export class PrestamoUtils {
  
  /**
   * Calcula el progreso de cobro de un préstamo
   * @param fondo - Fondo de tipo préstamo
   * @returns Porcentaje de progreso (0-100)
   */
  static calcularProgresoCobro(fondo: Fondo): number {
    if (!fondo.metaAhorro || fondo.metaAhorro === 0 || fondo.tipo !== 'prestamo') {
      return 0;
    }
    
    // Progreso = (monto_original - deuda_actual) / monto_original * 100
    const montoCobrado = fondo.metaAhorro - fondo.saldoActual;
    const progreso = (montoCobrado / fondo.metaAhorro) * 100;
    
    return Math.min(Math.max(Math.round(progreso), 0), 100);
  }

  /**
   * Calcula el monto cobrado hasta ahora
   * @param fondo - Fondo de tipo préstamo
   * @returns Monto cobrado
   */
  static calcularMontoCobrado(fondo: Fondo): number {
    if (!fondo.metaAhorro || fondo.tipo !== 'prestamo') {
      return 0;
    }
    
    return fondo.metaAhorro - fondo.saldoActual;
  }

  /**
   * Verifica si el préstamo está completamente cobrado
   * @param fondo - Fondo de tipo préstamo
   * @returns True si está totalmente cobrado
   */
  static estaCompletamenteCobrado(fondo: Fondo): boolean {
    return fondo.tipo === 'prestamo' && fondo.saldoActual === 0;
  }

  /**
   * Obtiene el estado descriptivo del préstamo
   * @param fondo - Fondo de tipo préstamo
   * @returns Estado del préstamo
   */
  static obtenerEstadoPrestamo(fondo: Fondo): {
    estado: 'pendiente' | 'parcial' | 'cobrado';
    descripcion: string;
    clase: string;
  } {
    if (fondo.tipo !== 'prestamo') {
      return { estado: 'pendiente', descripcion: 'No es un préstamo', clase: '' };
    }

    if (fondo.saldoActual === 0) {
      return {
        estado: 'cobrado',
        descripcion: 'Préstamo totalmente cobrado',
        clase: 'estado-cobrado'
      };
    } else if (fondo.saldoActual < (fondo.metaAhorro || 0)) {
      return {
        estado: 'parcial',
        descripcion: 'Préstamo parcialmente cobrado',
        clase: 'estado-parcial'
      };
    } else {
      return {
        estado: 'pendiente',
        descripcion: 'Préstamo pendiente por cobrar',
        clase: 'estado-pendiente'
      };
    }
  }

  /**
   * Formatea el monto del préstamo con emoji y descripción
   * @param fondo - Fondo de tipo préstamo
   * @returns String formateado
   */
  static formatearMontoPrestamo(fondo: Fondo): string {
    if (fondo.tipo !== 'prestamo') {
      return '';
    }

    const montoCobrado = this.calcularMontoCobrado(fondo);
    const montoTotal = fondo.metaAhorro || 0;
    const progreso = this.calcularProgresoCobro(fondo);

    if (progreso === 100) {
      return `✅ Prestado: ${montoTotal.toLocaleString()} - Totalmente cobrado`;
    } else if (progreso > 0) {
      return `🔄 Prestado: ${montoTotal.toLocaleString()} - Cobrado: ${montoCobrado.toLocaleString()} (${progreso}%)`;
    } else {
      return `⏳ Prestado: ${montoTotal.toLocaleString()} - Pendiente por cobrar`;
    }
  }

  /**
   * Obtiene el emoji apropiado según el progreso del préstamo
   * @param fondo - Fondo de tipo préstamo
   * @returns Emoji representativo
   */
  static obtenerEmoji(fondo: Fondo): string {
    if (fondo.tipo !== 'prestamo') {
      return '💰';
    }

    const progreso = this.calcularProgresoCobro(fondo);

    if (progreso === 100) {
      return '✅'; // Totalmente cobrado
    } else if (progreso >= 50) {
      return '🔄'; // Parcialmente cobrado
    } else if (progreso > 0) {
      return '⏳'; // Poco cobrado
    } else {
      return '🤝'; // Sin cobrar
    }
  }

  /**
   * Valida si un monto es válido para un préstamo
   * @param monto - Monto a validar
   * @returns True si es válido
   */
  static validarMontoPrestamo(monto: number): { valido: boolean; mensaje: string } {
    if (!monto || isNaN(monto)) {
      return { valido: false, mensaje: 'El monto del préstamo es requerido' };
    }

    if (monto <= 0) {
      return { valido: false, mensaje: 'El monto del préstamo debe ser mayor a 0' };
    }

    if (monto < 1000) {
      return { valido: false, mensaje: 'El monto mínimo para un préstamo es $1,000' };
    }

    return { valido: true, mensaje: 'Monto válido' };
  }
}
