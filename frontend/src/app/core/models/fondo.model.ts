export interface Fondo {
  _id?: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoFondo;
  saldoActual: number; // Saldo actual del fondo (puede ser negativo para préstamos)
  metaAhorro?: number; // Meta de ahorro (obligatoria para fondos tipo 'ahorro' y 'prestamo')
  fechaCreacion?: Date;
  activo?: boolean;
}

// 🔧 MODIFICADO: Cuatro tipos de fondo incluyen deudas
export type TipoFondo = 'registro' | 'ahorro' | 'prestamo' | 'deuda';

export interface CreateFondoDto {
  nombre: string;
  descripcion?: string;
  tipo: TipoFondo;
  saldoActual?: number; // Saldo inicial (puede ser negativo para préstamos)
  metaAhorro?: number; // Meta (obligatoria para fondos de ahorro y préstamos)
}

export interface UpdateFondoDto {
  nombre?: string;
  descripcion?: string;
  tipo?: TipoFondo;
  metaAhorro?: number; // Meta (obligatoria para fondos de ahorro y préstamos)
  activo?: boolean;
  // saldoActual no se actualiza directamente, solo via transacciones
}

// Interfaces específicas para préstamos
export interface EstadisticasPrestamos {
  totalPrestamos: number;
  prestamosActivos: number;
  montoTotalPrestado: number;
  montoTotalPagado: number;
  montoTotalPendiente: number;
  progresoPromedioPagos: number;
}

export interface ProgresoPrestamo {
  porcentajePagado: number;
  montoPagado: number;
  montoPendiente: number;
  estaCompletado: boolean;
}

// 🆕 NUEVO: Interfaces específicas para deudas
export interface EstadisticasDeudas {
  totalDeudas: number;
  deudasActivas: number;
  montoTotalDebe: number;
  montoTotalPagado: number;
  montoTotalPendiente: number;
  progresoPromedioPagos: number;
}

export interface ProgresoDeuda {
  porcentajePagado: number;
  montoPagado: number;
  montoPendiente: number;
  estaLiquidada: boolean;
}

// Utilidades para trabajar con préstamos
export class PrestamoUtils {
  /**
   * Determina si un fondo es un préstamo
   */
  static esPrestamo(fondo: Fondo): boolean {
    return fondo.tipo === 'prestamo';
  }

  /**
   * Calcula el progreso de pago local (sin llamada al servidor)
   */
  static calcularProgreso(fondo: Fondo): ProgresoPrestamo {
    if (!this.esPrestamo(fondo)) {
      throw new Error('Esta función solo es válida para fondos tipo préstamo');
    }

    const metaAhorro = fondo.metaAhorro || 0;
    const montoPagado = metaAhorro + fondo.saldoActual; // saldo negativo + meta positiva
    const montoPendiente = Math.abs(fondo.saldoActual);
    const porcentajePagado = metaAhorro > 0 ? (montoPagado / metaAhorro) * 100 : 0;
    const estaCompletado = fondo.saldoActual >= 0;

    return {
      porcentajePagado: Math.max(0, Math.min(100, porcentajePagado)),
      montoPagado: Math.max(0, montoPagado),
      montoPendiente,
      estaCompletado
    };
  }

  /**
   * Obtiene el texto apropiado para mostrar el "saldo"
   */
  static getTextoSaldo(fondo: Fondo): string {
    if (this.esPrestamo(fondo)) {
      return 'Cuentas por Cobrar';
    }
    return 'Saldo Actual';
  }

  /**
   * Obtiene el color apropiado para la barra de progreso
   */
  static getColorProgreso(progreso: number, estaCompletado: boolean): string {
    if (estaCompletado) return '#4caf50'; // Verde - Completado
    if (progreso >= 80) return '#8bc34a'; // Verde claro - Casi completo
    if (progreso >= 50) return '#ffc107'; // Amarillo - Progreso medio
    if (progreso >= 20) return '#ff9800'; // Naranja - Progreso bajo
    return '#f44336'; // Rojo - Apenas comenzado
  }

  /**
   * Formatea el monto para mostrar (positivo para préstamos)
   */
  static formatearMonto(fondo: Fondo): number {
    if (this.esPrestamo(fondo)) {
      return Math.abs(fondo.saldoActual); // Mostrar siempre positivo
    }
    return fondo.saldoActual;
  }
}

// 🆕 NUEVO: Utilidades para trabajar con deudas
export class DeudaUtils {
  /**
   * Determina si un fondo es una deuda
   */
  static esDeuda(fondo: Fondo): boolean {
    return fondo.tipo === 'deuda';
  }

  /**
   * Calcula el progreso de pago de deuda local
   */
  static calcularProgreso(fondo: Fondo): ProgresoDeuda {
    if (!this.esDeuda(fondo)) {
      throw new Error('Esta función solo es válida para fondos tipo deuda');
    }

    const metaAhorro = fondo.metaAhorro || 0;
    const montoPagado = metaAhorro + fondo.saldoActual; // saldo negativo + meta positiva
    const montoPendiente = Math.abs(fondo.saldoActual);
    const porcentajePagado = metaAhorro > 0 ? (montoPagado / metaAhorro) * 100 : 0;
    const estaLiquidada = fondo.saldoActual >= 0;

    return {
      porcentajePagado: Math.max(0, Math.min(100, porcentajePagado)),
      montoPagado: Math.max(0, montoPagado),
      montoPendiente,
      estaLiquidada
    };
  }

  /**
   * Obtiene el texto apropiado para mostrar el "saldo"
   */
  static getTextoSaldo(fondo: Fondo): string {
    if (this.esDeuda(fondo)) {
      return 'Cuentas por Pagar';
    }
    return 'Saldo Actual';
  }

  /**
   * Obtiene el color apropiado para deudas (rojo)
   */
  static getColorProgreso(progreso: number, estaLiquidada: boolean): string {
    if (estaLiquidada) return '#4caf50'; // Verde - Liquidada
    if (progreso >= 80) return '#ff9800'; // Naranja - Casi liquidada
    if (progreso >= 50) return '#ff5722'; // Rojo naranja - Progreso medio
    if (progreso >= 20) return '#f44336'; // Rojo - Progreso bajo
    return '#d32f2f'; // Rojo oscuro - Apenas comenzado
  }

  /**
   * Formatea el monto para mostrar (positivo para deudas)
   */
  static formatearMonto(fondo: Fondo): number {
    if (this.esDeuda(fondo)) {
      return Math.abs(fondo.saldoActual); // Mostrar siempre positivo
    }
    return fondo.saldoActual;
  }
}