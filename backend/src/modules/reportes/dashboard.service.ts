import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Fondo, FondoDocument } from '../fondos/schemas/fondo.schema';
import { Transaccion, TransaccionDocument } from '../transacciones/schemas/transaccion.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Fondo.name) private fondoModel: Model<FondoDocument>,
    @InjectModel(Transaccion.name) private transaccionModel: Model<TransaccionDocument>,
  ) {}

  async obtenerResumenFinanciero(usuarioId: string, fechaInicio?: string, fechaFin?: string) {
    console.log('📊 DashboardService - Obteniendo resumen financiero para usuario:', usuarioId);
    
    // Construir filtros de fecha
    const filtroFecha: any = {};
    if (fechaInicio || fechaFin) {
      filtroFecha.fecha = {};
      if (fechaInicio) filtroFecha.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) filtroFecha.fecha.$lte = new Date(fechaFin);
    }

    // Obtener transacciones del usuario con filtros
    const transacciones = await this.transaccionModel
      .find({
        usuarioId: new Types.ObjectId(usuarioId),
        ...filtroFecha
      })
      .populate('fondoId', 'nombre tipo')
      .exec();

    console.log(`📊 Transacciones encontradas para usuario ${usuarioId}:`, transacciones.length);

    // Calcular totales
    const totalIngresos = transacciones
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);

    const totalGastos = transacciones
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.monto, 0);

    const balance = totalIngresos - totalGastos;

    // Obtener fondos del usuario
    const fondos = await this.fondoModel
      .find({ 
        usuarioId: new Types.ObjectId(usuarioId),
        activo: true 
      })
      .exec();

    // Procesar fondos por tipo
    const fondosPorTipo = this.procesarFondosPorTipo(fondos, transacciones);

    // Procesar transacciones por categoría
    const transaccionesPorCategoria = this.procesarTransaccionesPorCategoria(transacciones);

    const resultado = {
      totalIngresos,
      totalGastos,
      balance,
      fondosPorTipo,
      transaccionesPorCategoria,
      tendenciaMensual: [] // Se puede implementar después
    };

    console.log('✅ DashboardService - Resumen financiero calculado:', resultado);
    return resultado;
  }

  async obtenerEstadisticas(usuarioId: string) {
    console.log('📈 DashboardService - Obteniendo estadísticas para usuario:', usuarioId);
    
    // Obtener fondos del usuario
    const fondos = await this.fondoModel
      .find({ usuarioId: new Types.ObjectId(usuarioId) })
      .exec();

    const fondosActivos = fondos.filter(f => f.activo);

    // Obtener transacciones del usuario
    const transacciones = await this.transaccionModel
      .find({ usuarioId: new Types.ObjectId(usuarioId) })
      .exec();

    // Calcular transacciones de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    const transaccionesHoy = transacciones.filter(t => 
      t.fecha >= hoy && t.fecha < mañana
    ).length;

    // Calcular transacciones de este mes
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);

    const transaccionesMes = transacciones.filter(t => 
      t.fecha >= inicioMes && t.fecha <= finMes
    ).length;

    // Calcular mayor gasto del usuario
    const gastos = transacciones.filter(t => t.tipo === 'gasto');
    const mayorGasto = gastos.length > 0 
      ? Math.max(...gastos.map(t => t.monto))
      : 0;

    // Calcular mayor ingreso del usuario
    const ingresos = transacciones.filter(t => t.tipo === 'ingreso');
    const mayorIngreso = ingresos.length > 0 
      ? Math.max(...ingresos.map(t => t.monto))
      : 0;

    const resultado = {
      totalFondos: fondos.length,
      fondosActivos: fondosActivos.length,
      transaccionesHoy,
      transaccionesMes,
      mayorGasto,
      mayorIngreso
    };

    console.log('✅ DashboardService - Estadísticas calculadas:', resultado);
    return resultado;
  }

  async verificarConectividad(): Promise<boolean> {
    try {
      // Hacer una consulta simple para verificar la conexión
      await this.fondoModel.findOne().limit(1).exec();
      return true;
    } catch (error) {
      console.error('❌ Error de conectividad:', error);
      return false;
    }
  }

  private procesarFondosPorTipo(fondos: any[], transacciones: any[]) {
    const tiposMap = new Map();

    fondos.forEach(fondo => {
      const tipo = fondo.tipo;
      
      if (!tiposMap.has(tipo)) {
        tiposMap.set(tipo, {
          tipo,
          cantidad: 0,
          montoTotal: 0,
          progreso: 0
        });
      }

      const tipoData = tiposMap.get(tipo);
      tipoData.cantidad += 1;
      tipoData.montoTotal += fondo.saldoActual || 0;
    });

    // Calcular progreso basado en metas
    tiposMap.forEach((value) => {
      if (value.montoTotal > 0) {
        // Progreso basado en un objetivo promedio
        value.progreso = Math.min((value.montoTotal / (value.cantidad * 500000)) * 100, 100);
      }
    });

    return Array.from(tiposMap.values());
  }

  private procesarTransaccionesPorCategoria(transacciones: any[]) {
    const categoriasMap = new Map();

    transacciones.forEach(t => {
      const categoria = t.categoria;
      
      if (!categoriasMap.has(categoria)) {
        categoriasMap.set(categoria, {
          categoria,
          cantidad: 0,
          monto: 0,
          tipo: t.tipo
        });
      }

      const categoriaData = categoriasMap.get(categoria);
      categoriaData.cantidad += 1;
      categoriaData.monto += t.monto;
    });

    return Array.from(categoriasMap.values())
      .sort((a, b) => b.monto - a.monto);
  }
}
