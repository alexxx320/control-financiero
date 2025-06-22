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

  async obtenerEstadisticas(usuarioId: string, fechaInicio?: string, fechaFin?: string) {
    console.log('📈 DashboardService - Obteniendo estadísticas para usuario:', usuarioId);
    
    // Obtener fondos del usuario
    const fondos = await this.fondoModel
      .find({ usuarioId: new Types.ObjectId(usuarioId) })
      .exec();

    const fondosActivos = fondos.filter(f => f.activo);

    // Construir filtros de fecha base
    const filtroBase = { usuarioId: new Types.ObjectId(usuarioId) };
    
    // Obtener todas las transacciones del usuario para estadísticas generales
    const todasLasTransacciones = await this.transaccionModel
      .find(filtroBase)
      .exec();

    // Construir filtros de fecha para el período específico
    const filtroFecha: any = { ...filtroBase };
    if (fechaInicio || fechaFin) {
      filtroFecha.fecha = {};
      if (fechaInicio) filtroFecha.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) filtroFecha.fecha.$lte = new Date(fechaFin);
    }

    // Obtener transacciones filtradas por el período seleccionado
    const transaccionesFiltradas = await this.transaccionModel
      .find(filtroFecha)
      .exec();

    // Calcular transacciones de hoy (siempre fijo)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    const transaccionesHoy = todasLasTransacciones.filter(t => 
      t.fecha >= hoy && t.fecha < mañana
    ).length;

    // Para transaccionesMes, usar las transacciones filtradas del período seleccionado
    const transaccionesMes = transaccionesFiltradas.length;

    // Calcular mayor gasto del período filtrado
    const gastosFiltrados = transaccionesFiltradas.filter(t => t.tipo === 'gasto');
    const mayorGasto = gastosFiltrados.length > 0 
      ? Math.max(...gastosFiltrados.map(t => t.monto))
      : 0;

    // Calcular mayor ingreso del período filtrado
    const ingresosFiltrados = transaccionesFiltradas.filter(t => t.tipo === 'ingreso');
    const mayorIngreso = ingresosFiltrados.length > 0 
      ? Math.max(...ingresosFiltrados.map(t => t.monto))
      : 0;

    const resultado = {
      totalFondos: fondos.length,
      fondosActivos: fondosActivos.length,
      transaccionesHoy,
      transaccionesMes, // Ahora contiene las transacciones del período filtrado
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
