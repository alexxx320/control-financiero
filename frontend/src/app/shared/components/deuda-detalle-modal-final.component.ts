  getProgresoDeuda(): {
    porcentajePagado: number;
    montoPagado: number;
    montoPendiente: number;
    estaLiquidada: boolean;
  } {
    if (this.data.tipo !== 'deuda') {
      return { porcentajePagado: 0, montoPagado: 0, montoPendiente: 0, estaLiquidada: false };
    }

    const montoPagado = this.data.metaAhorro + this.data.saldoActual;
    const montoPendiente = Math.abs(this.data.saldoActual);
    const porcentajePagado = (montoPagado / this.data.metaAhorro) * 100;
    const estaLiquidada = this.data.saldoActual >= 0;

    return {
      porcentajePagado: Math.max(0, Math.min(100, porcentajePagado)),
      montoPagado: Math.max(0, montoPagado),
      montoPendiente,
      estaLiquidada
    };
  }
}