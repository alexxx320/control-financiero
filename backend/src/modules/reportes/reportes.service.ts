import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Fondo, FondoDocument } from '../fondos/schemas/fondo.schema';
import { Transaccion, TransaccionDocument } from '../transacciones/schemas/transaccion.schema';
import { 
  IReporteMensual, 
  IReporteFondo, 
  IResumenPeriodo,
  TipoTransaccion,
  IAlerta,
  TipoAlerta,
  PrioridadAlerta,
  IEstadisticas,
  CategoriaTransaccion
} from '@/common/interfaces/financiero.interface';
// import * as moment from 'moment'; // Removido para evitar conflictos

@Injectable()
export class ReportesService {
  constructor(
    @InjectModel(Fondo.name) private fondoModel: Model<FondoDocument>,
    @InjectModel(Transaccion.name) private transaccionModel: Model<TransaccionDocument>,
  ) {}

  async generarReporteMensual(mes: number, año: number, usuarioId: string): Promise<IReporteMensual> {
    console.log(`📊 Generando reporte mensual para usuario ${usuarioId}: ${mes}/${año}`);
    
    if (mes < 1 || mes > 12) {
      throw new Error('El mes debe estar entre 1 y 12');
    }

    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59);

    console.log(`📅 Rango de fechas: ${fechaInicio.toISOString()} - ${fechaFin.toISOString()}`);

    // Filtrar fondos por usuario
    const fondos = await this.fondoModel.find({ 
      usuarioId: new Types.ObjectId(usuarioId),
      activo: true 
    }).exec();
    
    console.log(`💰 Fondos encontrados: ${fondos.length}`);
    
    const reportesFondos: IReporteFondo[] = [];
    
    let totalIngresosMes = 0;
    let totalGastosMes = 0;
    let totalTransacciones = 0;

    for (const fondo of fondos) {
      console.log(`📋 Procesando fondo: ${fondo.nombre} (ID: ${fondo._id})`);
      
      // Buscar transacciones del mes para este fondo
      const transaccionesMes = await this.transaccionModel
        .find({
          fondoId: fondo._id,
          usuarioId: new Types.ObjectId(usuarioId),
          fecha: { $gte: fechaInicio, $lte: fechaFin }
        })
        .exec();

      console.log(`📊 Transacciones del mes para ${fondo.nombre}: ${transaccionesMes.length}`);

      const ingresosMes = transaccionesMes
        .filter(t => t.tipo === TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
        .reduce((sum, t) => sum + t.monto, 0);

      const gastosMes = transaccionesMes
        .filter(t => t.tipo === TipoTransaccion.GASTO && t.categoria !== 'transferencia')
        .reduce((sum, t) => sum + t.monto, 0);

      console.log(`💰 ${fondo.nombre} - Ingresos: ${ingresosMes}, Gastos: ${gastosMes}`);

      // Buscar todas las transacciones históricas de este fondo
      const todasTransacciones = await this.transaccionModel
        .find({ 
          fondoId: fondo._id,
          usuarioId: new Types.ObjectId(usuarioId)
        })
        .exec();

      console.log(`📈 Transacciones históricas para ${fondo.nombre}: ${todasTransacciones.length}`);

      const totalIngresosFondo = todasTransacciones
        .filter(t => t.tipo === TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
        .reduce((sum, t) => sum + t.monto, 0);

      const totalGastosFondo = todasTransacciones
        .filter(t => t.tipo === TipoTransaccion.GASTO && t.categoria !== 'transferencia')
        .reduce((sum, t) => sum + t.monto, 0);

      // Usar el saldo actual del fondo directamente
      const balanceFinal = fondo.saldoActual;
      const balanceInicial = balanceFinal - (ingresosMes - gastosMes);

      const reporteFondo: IReporteFondo = {
        nombre: fondo.nombre,
        balanceInicial,
        ingresos: ingresosMes,
        gastos: gastosMes,
        balanceNeto: ingresosMes - gastosMes,
        balanceFinal,
        transacciones: transaccionesMes.length,
      };

      console.log(`📊 Reporte de fondo ${fondo.nombre}:`, reporteFondo);
      reportesFondos.push(reporteFondo);

      totalIngresosMes += ingresosMes;
      totalGastosMes += gastosMes;
      totalTransacciones += transaccionesMes.length;
    }

    const resumen: IResumenPeriodo = {
      totalIngresos: totalIngresosMes,
      totalGastos: totalGastosMes,
      balanceNeto: totalIngresosMes - totalGastosMes,
      transaccionesTotales: totalTransacciones,
    };

    console.log(`✅ Reporte mensual generado para usuario ${usuarioId}:`, {
      fondos: reportesFondos.length,
      resumen
    });

    // Formatear período sin moment
    const fecha = new Date(año, mes - 1, 1);
    const periodo = fecha.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });

    return {
      periodo: periodo.charAt(0).toUpperCase() + periodo.slice(1),
      mes,
      año,
      fondos: reportesFondos,
      resumen,
    };
  }

  async obtenerAlertasFinancieras(usuarioId: string): Promise<IAlerta[]> {
    console.log(`🚨 Obteniendo alertas financieras para usuario ${usuarioId}`);
    
    const alertas: IAlerta[] = [];
    const fondos = await this.fondoModel.find({ 
      usuarioId: new Types.ObjectId(usuarioId),
      activo: true 
    }).exec();

    for (const fondo of fondos) {
      const transacciones = await this.transaccionModel
        .find({ 
          fondoId: fondo._id,
          usuarioId: new Types.ObjectId(usuarioId)
        })
        .exec();

      const totalIngresos = transacciones
        .filter(t => t.tipo === TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
        .reduce((sum, t) => sum + t.monto, 0);

      const totalGastos = transacciones
        .filter(t => t.tipo === TipoTransaccion.GASTO && t.categoria !== 'transferencia')
        .reduce((sum, t) => sum + t.monto, 0);

      const balance = totalIngresos - totalGastos;

      // Alerta por balance negativo
      if (balance < 0) {
        alertas.push({
          tipo: TipoAlerta.ERROR,
          fondo: fondo.nombre,
          mensaje: `Balance negativo: $${Math.abs(balance).toLocaleString()}`,
          prioridad: PrioridadAlerta.ALTA,
        });
      }

      // Alerta por progreso de meta
      if (fondo.metaAhorro > 0) {
        const progresoMeta = (balance / fondo.metaAhorro) * 100;
        
        if (progresoMeta >= 90) {
          alertas.push({
            tipo: TipoAlerta.EXITO,
            fondo: fondo.nombre,
            mensaje: `¡Cerca de la meta! Progreso: ${progresoMeta.toFixed(1)}%`,
            prioridad: PrioridadAlerta.BAJA,
          });
        } else if (progresoMeta < 25) {
          alertas.push({
            tipo: TipoAlerta.ADVERTENCIA,
            fondo: fondo.nombre,
            mensaje: `Progreso bajo hacia la meta: ${progresoMeta.toFixed(1)}%`,
            prioridad: PrioridadAlerta.MEDIA,
          });
        }
      }

      // Alerta por inactividad
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);
      
      const transaccionesRecientes = transacciones.filter(
        t => t.fecha >= fechaLimite
      );

      if (transacciones.length > 0 && transaccionesRecientes.length === 0) {
        alertas.push({
          tipo: TipoAlerta.INFO,
          fondo: fondo.nombre,
          mensaje: 'Sin movimientos en los últimos 30 días',
          prioridad: PrioridadAlerta.BAJA,
        });
      }
    }

    // Alerta por balance total negativo
    const balanceTotal = await this.calcularBalanceTotal(usuarioId);
    if (balanceTotal < 0) {
      alertas.push({
        tipo: TipoAlerta.ERROR,
        fondo: 'General',
        mensaje: `Balance total negativo: $${Math.abs(balanceTotal).toLocaleString()}`,
        prioridad: PrioridadAlerta.ALTA,
      });
    }

    return alertas.sort((a, b) => {
      const prioridadOrden = { alta: 3, media: 2, baja: 1 };
      return prioridadOrden[b.prioridad] - prioridadOrden[a.prioridad];
    });
  }

  async obtenerEstadisticasGenerales(usuarioId: string): Promise<IEstadisticas> {
    console.log(`📈 Obteniendo estadísticas generales para usuario ${usuarioId}`);
    
    const [fondos, transacciones] = await Promise.all([
      this.fondoModel.find({ 
        usuarioId: new Types.ObjectId(usuarioId),
        activo: true 
      }).exec(),
      this.transaccionModel.find({
        usuarioId: new Types.ObjectId(usuarioId)
      }).exec(),
    ]);

    const totalIngresos = transacciones
      .filter(t => t.tipo === TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
      .reduce((sum, t) => sum + t.monto, 0);

    const totalGastos = transacciones
      .filter(t => t.tipo === TipoTransaccion.GASTO && t.categoria !== 'transferencia')
      .reduce((sum, t) => sum + t.monto, 0);

    const balanceTotal = totalIngresos - totalGastos;

    // 🆕 CALCULAR PATRIMONIO TOTAL (SUMA DE SALDOS ACTUALES DE TODOS LOS FONDOS)
    const sumaTotalFondos = fondos.reduce((sum, fondo) => sum + (fondo.saldoActual || 0), 0);
    console.log(`💰 Patrimonio Total calculado: ${sumaTotalFondos}`);

    // Encontrar fondo con mayor balance
    let fondoMayorBalance = 'N/A';
    let mayorBalance = -Infinity;

    for (const fondo of fondos) {
      const transaccionesFondo = transacciones.filter(
        t => t.fondoId.toString() === fondo._id.toString()
      );

      const ingresosFondo = transaccionesFondo
      .filter(t => t.tipo === TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
      .reduce((sum, t) => sum + t.monto, 0);

      const gastosFondo = transaccionesFondo
      .filter(t => t.tipo === TipoTransaccion.GASTO && t.categoria !== 'transferencia')
      .reduce((sum, t) => sum + t.monto, 0);

      const balanceFondo = ingresosFondo - gastosFondo;

      if (balanceFondo > mayorBalance) {
        mayorBalance = balanceFondo;
        fondoMayorBalance = fondo.nombre;
      }
    }

    // Encontrar categoría más frecuente
    const conteoCategoria = {};
    transacciones.forEach(t => {
      conteoCategoria[t.categoria] = (conteoCategoria[t.categoria] || 0) + 1;
    });

    let categoriaFrecuente = CategoriaTransaccion.OTROS;
    if (Object.keys(conteoCategoria).length > 0) {
      categoriaFrecuente = Object.keys(conteoCategoria).reduce((a, b) =>
        conteoCategoria[a] > conteoCategoria[b] ? a : b
      ) as CategoriaTransaccion;
    }

    // Calcular promedio de gasto mensual
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - 12);

    const gastosUltimoAño = transacciones
      .filter(t => t.tipo === TipoTransaccion.GASTO && t.categoria !== 'transferencia' && t.fecha >= fechaInicio)
      .reduce((sum, t) => sum + t.monto, 0);

    const promedioGastoMensual = gastosUltimoAño / 12;

    return {
      totalFondos: fondos.length,
      totalTransacciones: transacciones.length,
      balanceTotal,
      fondoMayorBalance,
      categoriaFrecuente,
      promedioGastoMensual: Math.round(promedioGastoMensual * 100) / 100,
      sumaTotalFondos, // 🆕 NUEVO KPI: Patrimonio Total (suma de saldos de fondos)
    };
  }

  async generarReporteAnual(año: number, usuarioId: string): Promise<{
    año: number;
    meses: Array<{
      mes: number;
      nombreMes: string;
      ingresos: number;
      gastos: number;
      balance: number;
      transacciones: number;
    }>;
    resumenAnual: {
      totalIngresos: number;
      totalGastos: number;
      balanceNeto: number;
      mejorMes: { nombre: string; balance: number } | null;
      peorMes: { nombre: string; balance: number } | null;
    };
  }> {
    console.log(`📅 Generando reporte anual para usuario ${usuarioId}: ${año}`);
    
    const meses = [];
    let totalIngresosAnual = 0;
    let totalGastosAnual = 0;

    for (let mes = 1; mes <= 12; mes++) {
      const reporteMes = await this.generarReporteMensual(mes, año, usuarioId);
      
      // Formatear nombre del mes sin moment
      const fechaMes = new Date(año, mes - 1, 1);
      const nombreMes = fechaMes.toLocaleDateString('es-ES', { month: 'long' });
      
      meses.push({
        mes,
        nombreMes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
        ingresos: reporteMes.resumen.totalIngresos,
        gastos: reporteMes.resumen.totalGastos,
        balance: reporteMes.resumen.balanceNeto,
        transacciones: reporteMes.resumen.transaccionesTotales,
      });

      totalIngresosAnual += reporteMes.resumen.totalIngresos;
      totalGastosAnual += reporteMes.resumen.totalGastos;
    }

    const mesesConBalance = meses.filter(m => m.transacciones > 0);
    const mejorMes = mesesConBalance.length > 0 
      ? mesesConBalance.reduce((prev, current) => 
          prev.balance > current.balance ? prev : current
        )
      : null;
    
    const peorMes = mesesConBalance.length > 0
      ? mesesConBalance.reduce((prev, current) => 
          prev.balance < current.balance ? prev : current
        )
      : null;

    return {
      año,
      meses,
      resumenAnual: {
        totalIngresos: totalIngresosAnual,
        totalGastos: totalGastosAnual,
        balanceNeto: totalIngresosAnual - totalGastosAnual,
        mejorMes: mejorMes ? { 
          nombre: mejorMes.nombreMes, 
          balance: mejorMes.balance 
        } : null,
        peorMes: peorMes ? { 
          nombre: peorMes.nombreMes, 
          balance: peorMes.balance 
        } : null,
      },
    };
  }

  async generarReportePorPeriodo(
    fechaInicio: Date, 
    fechaFin: Date, 
    nombrePeriodo: string, 
    usuarioId: string
  ): Promise<IReporteMensual> {
    console.log(`📊 Generando reporte para período personalizado: ${nombrePeriodo}`);
    console.log(`📅 Rango: ${fechaInicio.toISOString()} - ${fechaFin.toISOString()}`);
    
    // Filtrar fondos por usuario
    const fondos = await this.fondoModel.find({ 
      usuarioId: new Types.ObjectId(usuarioId),
      activo: true 
    }).exec();
    
    console.log(`💰 Fondos encontrados: ${fondos.length}`);
    
    const reportesFondos: IReporteFondo[] = [];
    
    let totalIngresosPeriodo = 0;
    let totalGastosPeriodo = 0;
    let totalTransacciones = 0;

    for (const fondo of fondos) {
      console.log(`📋 Procesando fondo: ${fondo.nombre} (ID: ${fondo._id})`);
      
      // Buscar transacciones del período para este fondo
      const transaccionesPeriodo = await this.transaccionModel
        .find({
          fondoId: fondo._id,
          usuarioId: new Types.ObjectId(usuarioId),
          fecha: { $gte: fechaInicio, $lte: fechaFin }
        })
        .exec();

      console.log(`📊 Transacciones del período para ${fondo.nombre}: ${transaccionesPeriodo.length}`);

      const ingresosPeriodo = transaccionesPeriodo
        .filter(t => t.tipo === TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
        .reduce((sum, t) => sum + t.monto, 0);

      const gastosPeriodo = transaccionesPeriodo
        .filter(t => t.tipo === TipoTransaccion.GASTO && t.categoria !== 'transferencia')
        .reduce((sum, t) => sum + t.monto, 0);

      console.log(`💰 ${fondo.nombre} - Ingresos: ${ingresosPeriodo}, Gastos: ${gastosPeriodo}`);

      // Buscar todas las transacciones históricas de este fondo para el balance inicial
      const todasTransaccionesAnteriores = await this.transaccionModel
        .find({ 
          fondoId: fondo._id,
          usuarioId: new Types.ObjectId(usuarioId),
          fecha: { $lt: fechaInicio }
        })
        .exec();

      const ingresosAnteriores = todasTransaccionesAnteriores
        .filter(t => t.tipo === TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
        .reduce((sum, t) => sum + t.monto, 0);

      const gastosAnteriores = todasTransaccionesAnteriores
        .filter(t => t.tipo === TipoTransaccion.GASTO && t.categoria !== 'transferencia')
        .reduce((sum, t) => sum + t.monto, 0);

      const balanceInicial = ingresosAnteriores - gastosAnteriores;
      const balanceFinal = balanceInicial + (ingresosPeriodo - gastosPeriodo);

      const reporteFondo: IReporteFondo = {
        nombre: fondo.nombre,
        balanceInicial,
        ingresos: ingresosPeriodo,
        gastos: gastosPeriodo,
        balanceNeto: ingresosPeriodo - gastosPeriodo,
        balanceFinal,
        transacciones: transaccionesPeriodo.length,
      };

      console.log(`📊 Reporte de fondo ${fondo.nombre}:`, reporteFondo);
      reportesFondos.push(reporteFondo);

      totalIngresosPeriodo += ingresosPeriodo;
      totalGastosPeriodo += gastosPeriodo;
      totalTransacciones += transaccionesPeriodo.length;
    }

    const resumen: IResumenPeriodo = {
      totalIngresos: totalIngresosPeriodo,
      totalGastos: totalGastosPeriodo,
      balanceNeto: totalIngresosPeriodo - totalGastosPeriodo,
      transaccionesTotales: totalTransacciones,
    };

    console.log(`✅ Reporte personalizado generado para período ${nombrePeriodo}:`, {
      fondos: reportesFondos.length,
      resumen
    });

    return {
      periodo: nombrePeriodo,
      mes: fechaInicio.getMonth() + 1, // Mes de inicio como referencia
      año: fechaInicio.getFullYear(),
      fondos: reportesFondos,
      resumen,
    };
  }

  // 🔧 MÉTODO CORREGIDO: FILTRADO POR PERÍODO Y SIN COLUMNA NOTAS
  async obtenerHistorialTransacciones(
    fechaInicio: Date,
    fechaFin: Date,
    usuarioId: string
  ): Promise<any[]> {
    console.log(`📈 [HISTORIAL] Obteniendo transacciones del ${fechaInicio.toLocaleDateString()} al ${fechaFin.toLocaleDateString()}`);
    console.log(`📈 [HISTORIAL] Usuario ID: ${usuarioId}`);
    console.log(`📈 [HISTORIAL] Fechas ISO: ${fechaInicio.toISOString()} - ${fechaFin.toISOString()}`);
    
    try {
      // ✅ CONFIRMAR: Este método YA filtra correctamente por fechas
      const transacciones = await this.transaccionModel
        .find({
          usuarioId: new Types.ObjectId(usuarioId),
          fecha: { $gte: fechaInicio, $lte: fechaFin }
        })
        .populate({
          path: 'fondoId',
          select: 'nombre tipo',
          strictPopulate: false
        })
        .sort({ fecha: -1 })
        .limit(50) // Limitar a las últimas 50 transacciones
        .exec();

      console.log(`📈 [HISTORIAL] Transacciones encontradas: ${transacciones.length}`);

      if (transacciones.length > 0) {
        console.log(`📈 [HISTORIAL] Primera transacción: ${transacciones[0].fecha}`);
        console.log(`📈 [HISTORIAL] Última transacción: ${transacciones[transacciones.length - 1].fecha}`);
      }

      const historial = transacciones.map(transaccion => ({
        id: transaccion._id,
        fecha: transaccion.fecha,
        descripcion: transaccion.descripcion,
        monto: transaccion.monto,
        tipo: transaccion.tipo,
        categoria: transaccion.categoria,
        fondo: transaccion.fondoId ? 
          (typeof transaccion.fondoId === 'object' ? 
            (transaccion.fondoId as any).nombre : 'Fondo no encontrado'
          ) : 'Sin fondo',
        // 🚫 REMOVIDO: Campo notas para evitar columnas vacías en exportaciones
        etiquetas: transaccion.etiquetas || []
      }));

      console.log(`✅ [HISTORIAL] Historial procesado: ${historial.length} transacciones`);
      console.log(`📊 [HISTORIAL] Ejemplo de transacción:`, historial[0] || 'Sin transacciones');
      
      return historial;
    } catch (error) {
      console.error(`❌ [HISTORIAL] Error al obtener historial:`, error);
      console.error(`❌ [HISTORIAL] Parámetros:`, { fechaInicio, fechaFin, usuarioId });
      throw error;
    }
  }

  private async calcularBalanceTotal(usuarioId: string): Promise<number> {
    const transacciones = await this.transaccionModel.find({
      usuarioId: new Types.ObjectId(usuarioId)
    }).exec();
    
    const totalIngresos = transacciones
      .filter(t => t.tipo === TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
      .reduce((sum, t) => sum + t.monto, 0);
      
    const totalGastos = transacciones
      .filter(t => t.tipo === TipoTransaccion.GASTO && t.categoria !== 'transferencia')
      .reduce((sum, t) => sum + t.monto, 0);
    
    return totalIngresos - totalGastos;
  }
}
