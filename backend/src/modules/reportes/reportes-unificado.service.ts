import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Fondo } from '../fondos/schemas/fondo.schema';
import { Transaccion } from '../transacciones/schemas/transaccion.schema';

@Injectable()
export class ReportesUnificadoService {
  constructor(
    @InjectModel(Fondo.name) private fondoModel: Model<Fondo>,
    @InjectModel(Transaccion.name) private transaccionModel: Model<Transaccion>
  ) {}

  async generarReporteBase(usuarioId: string, fechaInicio: Date, fechaFin: Date) {
    const fondos = await this.fondoModel.find({ usuario: usuarioId }).exec();
    
    if (fondos.length === 0) {
      return {
        periodo: `${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}`,
        fechaInicio,
        fechaFin,
        fondos: [],
        resumen: {
          totalIngresos: 0,
          totalGastos: 0,
          balanceNeto: 0,
          transaccionesTotales: 0,
          fondosActivos: 0,
          promedioIngresoPorFondo: 0,
          promedioGastoPorFondo: 0
        }
      };
    }

    const fondosReporte = [];
    let totalIngresos = 0;
    let totalGastos = 0;
    let transaccionesTotales = 0;

    for (const fondo of fondos) {
      const transacciones = await this.transaccionModel.find({
        fondo: fondo._id,
        fecha: { $gte: fechaInicio, $lte: fechaFin }
      }).exec();

      let ingresos = 0;
      let gastos = 0;
      
      for (const trans of transacciones) {
        if (trans.tipo === 'ingreso') {
          ingresos += trans.monto;
        } else {
          gastos += trans.monto;
        }
      }

      const balanceNeto = ingresos - gastos;

      fondosReporte.push({
        id: fondo._id.toString(),
        nombre: fondo.nombre,
        tipo: fondo.tipo || 'general',
        balanceInicial: 0,
        ingresos,
        gastos,
        balanceNeto,
        balanceFinal: balanceNeto,
        transacciones: transacciones.length
      });

      totalIngresos += ingresos;
      totalGastos += gastos;
      transaccionesTotales += transacciones.length;
    }

    return {
      periodo: `${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}`,
      fechaInicio,
      fechaFin,
      fondos: fondosReporte,
      resumen: {
        totalIngresos,
        totalGastos,
        balanceNeto: totalIngresos - totalGastos,
        transaccionesTotales,
        fondosActivos: fondos.length,
        promedioIngresoPorFondo: fondos.length > 0 ? totalIngresos / fondos.length : 0,
        promedioGastoPorFondo: fondos.length > 0 ? totalGastos / fondos.length : 0
      }
    };
  }

  async calcularKPIs(usuarioId: string, fechaInicio: Date, fechaFin: Date) {
    const reporte = await this.generarReporteBase(usuarioId, fechaInicio, fechaFin);
    
    return {
      totalIngresos: reporte.resumen.totalIngresos,
      totalGastos: reporte.resumen.totalGastos,
      utilidadNeta: reporte.resumen.balanceNeto,
      margenUtilidad: reporte.resumen.totalIngresos > 0 ? 
        (reporte.resumen.balanceNeto / reporte.resumen.totalIngresos) * 100 : 0,
      fondosActivos: reporte.resumen.fondosActivos,
      transaccionesPromedio: 0,
      crecimientoMensual: 0,
      liquidezTotal: reporte.fondos.reduce((sum, f) => sum + Math.max(0, f.balanceFinal), 0)
    };
  }

  async obtenerTendenciaMensual(usuarioId: string, meses: number = 6) {
    const tendencia = [];
    const fechaActual = new Date();

    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
      const fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const fechaFin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

      try {
        const reporte = await this.generarReporteBase(usuarioId, fechaInicio, fechaFin);
        
        tendencia.push({
          mes: fecha.toLocaleDateString('es-ES', { month: 'short' }),
          año: fecha.getFullYear(),
          ingresos: reporte.resumen.totalIngresos,
          gastos: reporte.resumen.totalGastos,
          utilidad: reporte.resumen.balanceNeto,
          transacciones: reporte.resumen.transaccionesTotales
        });
      } catch (error) {
        tendencia.push({
          mes: fecha.toLocaleDateString('es-ES', { month: 'short' }),
          año: fecha.getFullYear(),
          ingresos: 0,
          gastos: 0,
          utilidad: 0,
          transacciones: 0
        });
      }
    }

    return tendencia;
  }

  async obtenerDistribucionCategorias(usuarioId: string, fechaInicio: Date, fechaFin: Date) {
    const fondos = await this.fondoModel.find({ usuario: usuarioId }).exec();
    const fondosIds = fondos.map(f => f._id);

    const distribucion = await this.transaccionModel.aggregate([
      {
        $match: {
          fondo: { $in: fondosIds },
          fecha: { $gte: fechaInicio, $lte: fechaFin },
          tipo: 'gasto'
        }
      },
      {
        $group: {
          _id: '$categoria',
          monto: { $sum: '$monto' },
          transacciones: { $count: {} }
        }
      },
      {
        $sort: { monto: -1 }
      }
    ]);

    const totalGastos = distribucion.reduce((sum, item) => sum + item.monto, 0);

    return distribucion.map(item => ({
      categoria: item._id || 'Sin categoría',
      monto: item.monto,
      porcentaje: totalGastos > 0 ? (item.monto / totalGastos) * 100 : 0,
      transacciones: item.transacciones
    }));
  }

  async obtenerPerformanceFondos(usuarioId: string, fechaInicio: Date, fechaFin: Date) {
    const reporte = await this.generarReporteBase(usuarioId, fechaInicio, fechaFin);
    
    return reporte.fondos.map(fondo => ({
      id: fondo.id,
      nombre: fondo.nombre,
      tipo: fondo.tipo,
      balanceActual: fondo.balanceFinal,
      objetivo: 1000000,
      progresoMeta: Math.min((fondo.balanceFinal / 1000000) * 100, 100),
      rendimiento: fondo.balanceNeto > 0 ? 'bueno' : 'regular',
      crecimiento: 0
    }));
  }

  async obtenerFlujoCaja(usuarioId: string, fechaInicio: Date, fechaFin: Date) {
    const fondos = await this.fondoModel.find({ usuario: usuarioId }).exec();
    const fondosIds = fondos.map(f => f._id);

    const flujo = await this.transaccionModel.aggregate([
      {
        $match: {
          fondo: { $in: fondosIds },
          fecha: { $gte: fechaInicio, $lte: fechaFin }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } },
          entradas: { $sum: { $cond: [{ $eq: ["$tipo", "ingreso"] }, "$monto", 0] } },
          salidas: { $sum: { $cond: [{ $eq: ["$tipo", "gasto"] }, "$monto", 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return flujo.map(item => ({
      fecha: item._id,
      entradas: item.entradas,
      salidas: item.salidas,
      neto: item.entradas - item.salidas
    }));
  }

  async obtenerAlertasFinancieras(usuarioId: string) {
    const alertas = [];
    const fondos = await this.fondoModel.find({ usuario: usuarioId }).exec();
    
    for (const fondo of fondos) {
      const transacciones = await this.transaccionModel.find({ fondo: fondo._id }).exec();
      let balance = 0;
      
      for (const trans of transacciones) {
        if (trans.tipo === 'ingreso') {
          balance += trans.monto;
        } else {
          balance -= trans.monto;
        }
      }

      if (balance < 0) {
        alertas.push({
          tipo: 'ERROR',
          fondo: fondo.nombre,
          mensaje: `Balance negativo: $${Math.abs(balance).toLocaleString('es-CO')}`,
          prioridad: 'ALTA',
          fecha: new Date()
        });
      }

      if (balance > 0 && balance < 50000) {
        alertas.push({
          tipo: 'ADVERTENCIA',
          fondo: fondo.nombre,
          mensaje: `Balance bajo: $${balance.toLocaleString('es-CO')}`,
          prioridad: 'MEDIA',
          fecha: new Date()
        });
      }
    }

    return alertas.sort((a, b) => {
      const orden = { 'ALTA': 1, 'MEDIA': 2, 'BAJA': 3 };
      return orden[a.prioridad] - orden[b.prioridad];
    });
  }

  async obtenerEstadisticasGenerales(usuarioId: string) {
    const fondos = await this.fondoModel.find({ usuario: usuarioId }).exec();
    const fondosIds = fondos.map(f => f._id);

    const totalTransacciones = await this.transaccionModel.countDocuments({
      fondo: { $in: fondosIds }
    });

    return {
      totalFondos: fondos.length,
      totalTransacciones,
      balanceTotal: 0,
      fondoMayorBalance: fondos.length > 0 ? fondos[0].nombre : 'N/A',
      categoriaFrecuente: 'N/A',
      promedioGastoMensual: 0,
      diasDesdeUltimaTransaccion: 0
    };
  }

  async generarPDF(datos: any): Promise<Buffer> {
    // Implementación simplificada
    return Buffer.from('PDF generado');
  }

  async generarExcel(datos: any): Promise<Buffer> {
    // Implementación simplificada  
    return Buffer.from('Excel generado');
  }
}
