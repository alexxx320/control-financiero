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

  async obtenerDatosGrafico(usuarioId: string, fechaInicio?: string, fechaFin?: string) {
    console.log('📈 DashboardService - Obteniendo datos para gráfico:', usuarioId);
    
    // Construir filtros de fecha
    const filtroFecha: any = { usuarioId: new Types.ObjectId(usuarioId) };
    if (fechaInicio || fechaFin) {
      filtroFecha.fecha = {};
      if (fechaInicio) filtroFecha.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) filtroFecha.fecha.$lte = new Date(fechaFin);
    }

    // Obtener transacciones del usuario con filtros
    const transacciones = await this.transaccionModel
      .find(filtroFecha)
      .sort({ fecha: 1 })
      .exec();

    console.log(`📈 Transacciones para gráfico:`, transacciones.length);

    // Determinar el período de agrupación basado en el rango de fechas
    const periodo = this.determinarPeriodoAgrupacion(fechaInicio, fechaFin);
    console.log(`📈 Período de agrupación:`, periodo);

    // Agrupar transacciones por período
    const datosAgrupados = this.agruparTransaccionesPorPeriodo(transacciones, periodo);

    const resultado = {
      labels: datosAgrupados.map(d => d.label),
      ingresos: datosAgrupados.map(d => d.ingresos),
      gastos: datosAgrupados.map(d => d.gastos),
      periodo
    };

    console.log('✅ DashboardService - Datos de gráfico calculados:', resultado);
    return resultado;
  }

  private determinarPeriodoAgrupacion(fechaInicio?: string, fechaFin?: string): 'hora' | 'dia' | 'semana' | 'mes' {
    if (!fechaInicio || !fechaFin) {
      return 'mes'; // Por defecto
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffMs = fin.getTime() - inicio.getTime();
    const diffDias = diffMs / (1000 * 60 * 60 * 24);

    if (diffDias <= 1) {
      return 'hora';
    } else if (diffDias <= 7) {
      return 'dia';
    } else if (diffDias <= 31) {
      return 'semana';
    } else {
      return 'mes';
    }
  }

  private agruparTransaccionesPorPeriodo(transacciones: any[], periodo: 'hora' | 'dia' | 'semana' | 'mes') {
    const grupos = new Map();

    transacciones.forEach(transaccion => {
      const fecha = new Date(transaccion.fecha);
      let clave: string;

      switch (periodo) {
        case 'hora':
          clave = `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}-${fecha.getHours()}`;
          break;
        case 'dia':
          clave = `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`;
          break;
        case 'semana':
          const inicioSemana = new Date(fecha);
          inicioSemana.setDate(fecha.getDate() - fecha.getDay());
          clave = `${inicioSemana.getFullYear()}-${inicioSemana.getMonth()}-${inicioSemana.getDate()}`;
          break;
        case 'mes':
          clave = `${fecha.getFullYear()}-${fecha.getMonth()}`;
          break;
      }

      if (!grupos.has(clave)) {
        grupos.set(clave, {
          fecha: fecha,
          ingresos: 0,
          gastos: 0,
          label: this.generarLabelPeriodo(fecha, periodo)
        });
      }

      const grupo = grupos.get(clave);
      if (transaccion.tipo === 'ingreso') {
        grupo.ingresos += transaccion.monto;
      } else if (transaccion.tipo === 'gasto') {
        grupo.gastos += transaccion.monto;
      }
    });

    // Convertir a array y ordenar por fecha
    const resultado = Array.from(grupos.values())
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    return resultado;
  }

  private generarLabelPeriodo(fecha: Date, periodo: 'hora' | 'dia' | 'semana' | 'mes'): string {
    switch (periodo) {
      case 'hora':
        return fecha.getHours().toString().padStart(2, '0') + ':00';
      case 'dia':
        return fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      case 'semana':
        const inicioSemana = new Date(fecha);
        inicioSemana.setDate(fecha.getDate() - fecha.getDay());
        return `${inicioSemana.getDate()}/${inicioSemana.getMonth() + 1}`;
      case 'mes':
        return fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      default:
        return fecha.toLocaleDateString('es-ES');
    }
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
