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

    // Filtrar fondos por usuario
    const fondos = await this.fondoModel.find({ 
      usuarioId: new Types.ObjectId(usuarioId),
      activo: true 
    }).exec();
    
    const reportesFondos: IReporteFondo[] = [];
    
    let totalIngresosMes = 0;
    let totalGastosMes = 0;
    let totalTransacciones = 0;

    for (const fondo of fondos) {
      const transaccionesMes = await this.transaccionModel
        .find({
          fondoId: fondo._id,
          usuarioId: new Types.ObjectId(usuarioId), // Filtrar por usuario
          fecha: { $gte: fechaInicio, $lte: fechaFin }
        })
        .exec();

      const ingresosMes = transaccionesMes
        .filter(t => t.tipo === TipoTransaccion.INGRESO)
        .reduce((sum, t) => sum + t.monto, 0);

      const gastosMes = transaccionesMes
        .filter(t => t.tipo === TipoTransaccion.GASTO)
        .reduce((sum, t) => sum + t.monto, 0);

      const todasTransacciones = await this.transaccionModel
        .find({ 
          fondoId: fondo._id,
          usuarioId: new Types.ObjectId(usuarioId) // Filtrar por usuario
        })
        .exec();

      const totalIngresosFondo = todasTransacciones
        .filter(t => t.tipo === TipoTransaccion.INGRESO)
        .reduce((sum, t) => sum + t.monto, 0);

      const totalGastosFondo = todasTransacciones
        .filter(t => t.tipo === TipoTransaccion.GASTO)
        .reduce((sum, t) => sum + t.monto, 0);

      const balanceFinal = totalIngresosFondo - totalGastosFondo;
      const balanceInicial = balanceFinal - (ingresosMes - gastosMes);

      reportesFondos.push({
        nombre: fondo.nombre,
        balanceInicial,
        ingresos: ingresosMes,
        gastos: gastosMes,
        balanceNeto: ingresosMes - gastosMes,
        balanceFinal,
        transacciones: transaccionesMes.length,
      });

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

    console.log(`✅ Reporte mensual generado para usuario ${usuarioId}:`, resumen);

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
        .filter(t => t.tipo === TipoTransaccion.INGRESO)
        .reduce((sum, t) => sum + t.monto, 0);

      const totalGastos = transacciones
        .filter(t => t.tipo === TipoTransaccion.GASTO)
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
      .filter(t => t.tipo === TipoTransaccion.INGRESO)
      .reduce((sum, t) => sum + t.monto, 0);

    const totalGastos = transacciones
      .filter(t => t.tipo === TipoTransaccion.GASTO)
      .reduce((sum, t) => sum + t.monto, 0);

    const balanceTotal = totalIngresos - totalGastos;

    // Encontrar fondo con mayor balance
    let fondoMayorBalance = 'N/A';
    let mayorBalance = -Infinity;

    for (const fondo of fondos) {
      const transaccionesFondo = transacciones.filter(
        t => t.fondoId.toString() === fondo._id.toString()
      );

      const ingresosFondo = transaccionesFondo
        .filter(t => t.tipo === TipoTransaccion.INGRESO)
        .reduce((sum, t) => sum + t.monto, 0);

      const gastosFondo = transaccionesFondo
        .filter(t => t.tipo === TipoTransaccion.GASTO)
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
      .filter(t => t.tipo === TipoTransaccion.GASTO && t.fecha >= fechaInicio)
      .reduce((sum, t) => sum + t.monto, 0);

    const promedioGastoMensual = gastosUltimoAño / 12;

    return {
      totalFondos: fondos.length,
      totalTransacciones: transacciones.length,
      balanceTotal,
      fondoMayorBalance,
      categoriaFrecuente,
      promedioGastoMensual: Math.round(promedioGastoMensual * 100) / 100,
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

  private async calcularBalanceTotal(usuarioId: string): Promise<number> {
    const transacciones = await this.transaccionModel.find({
      usuarioId: new Types.ObjectId(usuarioId)
    }).exec();
    
    return transacciones
      .filter(t => t.tipo === TipoTransaccion.INGRESO)
      .reduce((sum, t) => sum + t.monto, 0) - 
      transacciones
      .filter(t => t.tipo === TipoTransaccion.GASTO)
      .reduce((sum, t) => sum + t.monto, 0);
  }
}
