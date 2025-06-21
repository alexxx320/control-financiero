import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Fondo, FondoDocument } from '../fondos/schemas/fondo.schema';
import { Transaccion, TransaccionDocument } from '../transacciones/schemas/transaccion.schema';
import { TipoTransaccion, CategoriaTransaccion } from '@/common/interfaces/financiero.interface';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

export interface IReporteEjecutivo {
  periodo: {
    inicio: Date;
    fin: Date;
    descripcion: string;
  };
  kpis: {
    totalIngresos: number;
    totalGastos: number;
    utilidadNeta: number;
    margenUtilidad: number;
    crecimiento: number;
    fondosActivos: number;
    transaccionesPromedio: number;
  };
  tendenciaMensual: Array<{
    mes: string;
    ingresos: number;
    gastos: number;
    utilidad: number;
    transacciones: number;
  }>;
  distribucionCategorias: Array<{
    categoria: string;
    monto: number;
    porcentaje: number;
    transacciones: number;
    tipo: 'ingreso' | 'gasto';
  }>;
  fondosPerformance: Array<{
    nombre: string;
    tipo: string;
    saldoActual: number;
    metaAhorro: number;
    progresoMeta: number;
    transacciones: number;
    rendimiento: 'excelente' | 'bueno' | 'regular' | 'malo';
  }>;
  flujoCaja: Array<{
    fecha: string;
    entradas: number;
    salidas: number;
    neto: number;
    acumulado: number;
  }>;
}

@Injectable()
export class ReportesEjecutivosService {
  constructor(
    @InjectModel(Fondo.name) private fondoModel: Model<FondoDocument>,
    @InjectModel(Transaccion.name) private transaccionModel: Model<TransaccionDocument>,
  ) {}

  async generarReporteEjecutivo(
    usuarioId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<IReporteEjecutivo> {
    console.log(`📊 Generando reporte ejecutivo para usuario ${usuarioId}`);
    
    // Obtener datos base
    const [fondos, transacciones] = await Promise.all([
      this.obtenerFondosUsuario(usuarioId),
      this.obtenerTransacciones(usuarioId, fechaInicio, fechaFin)
    ]);

    // Calcular KPIs principales
    const kpis = await this.calcularKPIs(usuarioId, transacciones, fondos);
    
    // Generar tendencia mensual
    const tendenciaMensual = await this.generarTendenciaMensual(usuarioId, fechaInicio, fechaFin);
    
    // Analizar distribución por categorías
    const distribucionCategorias = this.analizarDistribucionCategorias(transacciones);
    
    // Evaluar performance de fondos
    const fondosPerformance = await this.evaluarPerformanceFondos(usuarioId, fondos);
    
    // Calcular flujo de caja
    const flujoCaja = await this.calcularFlujoCaja(usuarioId, fechaInicio, fechaFin);

    return {
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin,
        descripcion: `${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}`
      },
      kpis,
      tendenciaMensual,
      distribucionCategorias,
      fondosPerformance,
      flujoCaja
    };
  }

  async exportarPDF(reporteEjecutivo: IReporteEjecutivo): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(24)
           .fillColor('#1565C0')
           .text('REPORTE EJECUTIVO FINANCIERO', { align: 'center' });
        
        doc.moveDown();
        doc.fontSize(14)
           .fillColor('#666666')
           .text(`Período: ${reporteEjecutivo.periodo.descripcion}`, { align: 'center' });
        
        doc.moveDown(2);

        // KPIs Section
        doc.fontSize(18)
           .fillColor('#333333')
           .text('INDICADORES CLAVE (KPIs)', { underline: true });
        
        doc.moveDown();
        
        const kpis = reporteEjecutivo.kpis;
        doc.fontSize(12);
        
        // Grid de KPIs
        const startY = doc.y;
        const colWidth = 250;
        
        doc.text(`Total Ingresos: $${kpis.totalIngresos.toLocaleString('es-CO')}`, 50, startY);
        doc.text(`Total Gastos: $${kpis.totalGastos.toLocaleString('es-CO')}`, 50 + colWidth, startY);
        
        doc.text(`Utilidad Neta: $${kpis.utilidadNeta.toLocaleString('es-CO')}`, 50, startY + 20);
        doc.text(`Margen Utilidad: ${kpis.margenUtilidad.toFixed(1)}%`, 50 + colWidth, startY + 20);
        
        doc.text(`Crecimiento: ${kpis.crecimiento.toFixed(1)}%`, 50, startY + 40);
        doc.text(`Fondos Activos: ${kpis.fondosActivos}`, 50 + colWidth, startY + 40);

        doc.y = startY + 80;

        // Performance de Fondos
        doc.moveDown(2);
        doc.fontSize(16)
           .text('PERFORMANCE DE FONDOS', { underline: true });
        
        doc.moveDown();
        doc.fontSize(11);
        
        // Headers
        doc.text('Fondo', 50, doc.y, { width: 150 });
        doc.text('Saldo Actual', 200, doc.y, { width: 100 });
        doc.text('Progreso Meta', 300, doc.y, { width: 80 });
        doc.text('Rendimiento', 380, doc.y, { width: 80 });
        doc.moveDown(0.5);
        
        // Línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(500, doc.y)
           .stroke();
        doc.moveDown(0.5);
        
        reporteEjecutivo.fondosPerformance.forEach((fondo) => {
          const y = doc.y;
          doc.text(fondo.nombre, 50, y, { width: 150 });
          doc.text(`$${fondo.saldoActual.toLocaleString('es-CO')}`, 200, y, { width: 100 });
          doc.text(`${fondo.progresoMeta.toFixed(1)}%`, 300, y, { width: 80 });
          doc.text(fondo.rendimiento.toUpperCase(), 380, y, { width: 80 });
          doc.moveDown(0.5);
        });

        // Tendencia Mensual
        doc.moveDown(2);
        doc.fontSize(16)
           .text('TENDENCIA MENSUAL', { underline: true });
        
        doc.moveDown();
        doc.fontSize(10);
        
        // Headers
        doc.text('Mes', 50, doc.y, { width: 80 });
        doc.text('Ingresos', 130, doc.y, { width: 100 });
        doc.text('Gastos', 230, doc.y, { width: 100 });
        doc.text('Utilidad', 330, doc.y, { width: 100 });
        doc.text('Transacciones', 430, doc.y, { width: 70 });
        doc.moveDown(0.5);
        
        // Línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(500, doc.y)
           .stroke();
        doc.moveDown(0.5);
        
        reporteEjecutivo.tendenciaMensual.forEach((mes) => {
          const y = doc.y;
          doc.text(mes.mes, 50, y, { width: 80 });
          doc.text(`$${mes.ingresos.toLocaleString('es-CO')}`, 130, y, { width: 100 });
          doc.text(`$${mes.gastos.toLocaleString('es-CO')}`, 230, y, { width: 100 });
          doc.text(`$${mes.utilidad.toLocaleString('es-CO')}`, 330, y, { width: 100 });
          doc.text(mes.transacciones.toString(), 430, y, { width: 70 });
          doc.moveDown(0.5);
        });

        // Footer
        doc.fontSize(8)
           .fillColor('#999999')
           .text(`Generado el ${new Date().toLocaleDateString('es-ES')} | Sistema de Control Financiero`, 
                 50, doc.page.height - 50, { align: 'center' });

        doc.end();
      } catch (error) {
        console.error('Error generando PDF:', error);
        reject(error);
      }
    });
  }

  async exportarExcel(reporteEjecutivo: IReporteEjecutivo): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    
    // Hoja 1: Resumen KPIs
    const kpisSheet = workbook.addWorksheet('KPIs');
    
    // Headers KPIs
    kpisSheet.addRow(['INDICADORES CLAVE DE RENDIMIENTO']);
    kpisSheet.addRow(['Período', reporteEjecutivo.periodo.descripcion]);
    kpisSheet.addRow([]);
    
    kpisSheet.addRow(['Métrica', 'Valor']);
    kpisSheet.addRow(['Total Ingresos', reporteEjecutivo.kpis.totalIngresos]);
    kpisSheet.addRow(['Total Gastos', reporteEjecutivo.kpis.totalGastos]);
    kpisSheet.addRow(['Utilidad Neta', reporteEjecutivo.kpis.utilidadNeta]);
    kpisSheet.addRow(['Margen Utilidad (%)', reporteEjecutivo.kpis.margenUtilidad]);
    kpisSheet.addRow(['Crecimiento (%)', reporteEjecutivo.kpis.crecimiento]);
    kpisSheet.addRow(['Fondos Activos', reporteEjecutivo.kpis.fondosActivos]);
    
    // Styling KPIs
    kpisSheet.getCell('A1').font = { bold: true, size: 16 };
    kpisSheet.getCell('A4').font = { bold: true };
    kpisSheet.getCell('B4').font = { bold: true };
    
    // Hoja 2: Tendencia Mensual
    const tendenciaSheet = workbook.addWorksheet('Tendencia Mensual');
    
    tendenciaSheet.addRow(['TENDENCIA MENSUAL']);
    tendenciaSheet.addRow([]);
    tendenciaSheet.addRow(['Mes', 'Ingresos', 'Gastos', 'Utilidad', 'Transacciones']);
    
    reporteEjecutivo.tendenciaMensual.forEach(mes => {
      tendenciaSheet.addRow([mes.mes, mes.ingresos, mes.gastos, mes.utilidad, mes.transacciones]);
    });
    
    // Styling Tendencia
    tendenciaSheet.getCell('A1').font = { bold: true, size: 16 };
    ['A3', 'B3', 'C3', 'D3', 'E3'].forEach(cell => {
      tendenciaSheet.getCell(cell).font = { bold: true };
    });
    
    // Hoja 3: Performance Fondos
    const fondosSheet = workbook.addWorksheet('Performance Fondos');
    
    fondosSheet.addRow(['PERFORMANCE DE FONDOS']);
    fondosSheet.addRow([]);
    fondosSheet.addRow(['Fondo', 'Tipo', 'Saldo Actual', 'Meta Ahorro', 'Progreso (%)', 'Rendimiento']);
    
    reporteEjecutivo.fondosPerformance.forEach(fondo => {
      fondosSheet.addRow([
        fondo.nombre, 
        fondo.tipo, 
        fondo.saldoActual, 
        fondo.metaAhorro, 
        fondo.progresoMeta, 
        fondo.rendimiento
      ]);
    });
    
    // Styling Fondos
    fondosSheet.getCell('A1').font = { bold: true, size: 16 };
    ['A3', 'B3', 'C3', 'D3', 'E3', 'F3'].forEach(cell => {
      fondosSheet.getCell(cell).font = { bold: true };
    });
    
    // Hoja 4: Distribución Categorías
    const categoriasSheet = workbook.addWorksheet('Categorías');
    
    categoriasSheet.addRow(['DISTRIBUCIÓN POR CATEGORÍAS']);
    categoriasSheet.addRow([]);
    categoriasSheet.addRow(['Categoría', 'Tipo', 'Monto', 'Porcentaje (%)', 'Transacciones']);
    
    reporteEjecutivo.distribucionCategorias.forEach(cat => {
      categoriasSheet.addRow([
        cat.categoria, 
        cat.tipo, 
        cat.monto, 
        cat.porcentaje, 
        cat.transacciones
      ]);
    });
    
    // Styling Categorías
    categoriasSheet.getCell('A1').font = { bold: true, size: 16 };
    ['A3', 'B3', 'C3', 'D3', 'E3'].forEach(cell => {
      categoriasSheet.getCell(cell).font = { bold: true };
    });
    
    // Hoja 5: Flujo de Caja
    const flujoSheet = workbook.addWorksheet('Flujo de Caja');
    
    flujoSheet.addRow(['FLUJO DE CAJA']);
    flujoSheet.addRow([]);
    flujoSheet.addRow(['Fecha', 'Entradas', 'Salidas', 'Neto', 'Acumulado']);
    
    reporteEjecutivo.flujoCaja.forEach(flujo => {
      flujoSheet.addRow([flujo.fecha, flujo.entradas, flujo.salidas, flujo.neto, flujo.acumulado]);
    });
    
    // Styling Flujo
    flujoSheet.getCell('A1').font = { bold: true, size: 16 };
    ['A3', 'B3', 'C3', 'D3', 'E3'].forEach(cell => {
      flujoSheet.getCell(cell).font = { bold: true };
    });
    
    // Auto ajustar columnas
    [kpisSheet, tendenciaSheet, fondosSheet, categoriasSheet, flujoSheet].forEach(sheet => {
      sheet.columns.forEach(column => {
        column.width = 15;
      });
    });
    
    return await workbook.xlsx.writeBuffer() as Buffer;
  }

  // Métodos auxiliares privados
  private async obtenerFondosUsuario(usuarioId: string): Promise<any[]> {
    return this.fondoModel.find({ 
      usuarioId: new Types.ObjectId(usuarioId),
      activo: true 
    }).exec();
  }

  private async obtenerTransacciones(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<any[]> {
    return this.transaccionModel.find({
      usuarioId: new Types.ObjectId(usuarioId),
      fecha: { $gte: fechaInicio, $lte: fechaFin }
    }).exec();
  }

  private async calcularKPIs(usuarioId: string, transacciones: any[], fondos: any[]): Promise<any> {
    const totalIngresos = transacciones
      .filter(t => t.tipo === TipoTransaccion.INGRESO)
      .reduce((sum, t) => sum + t.monto, 0);

    const totalGastos = transacciones
      .filter(t => t.tipo === TipoTransaccion.GASTO)
      .reduce((sum, t) => sum + t.monto, 0);

    const utilidadNeta = totalIngresos - totalGastos;
    const margenUtilidad = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;

    // Calcular crecimiento (placeholder)
    const crecimiento = 5.2; // Aquí calcularías el crecimiento real

    return {
      totalIngresos,
      totalGastos,
      utilidadNeta,
      margenUtilidad,
      crecimiento,
      fondosActivos: fondos.length,
      transaccionesPromedio: transacciones.length / 30
    };
  }

  private async generarTendenciaMensual(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<any[]> {
    const meses = [];
    const fechaActual = new Date(fechaInicio);
    
    while (fechaActual <= fechaFin) {
      const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
      const finMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
      
      const transaccionesMes = await this.transaccionModel.find({
        usuarioId: new Types.ObjectId(usuarioId),
        fecha: { $gte: inicioMes, $lte: finMes }
      }).exec();

      const ingresos = transaccionesMes
        .filter(t => t.tipo === TipoTransaccion.INGRESO)
        .reduce((sum, t) => sum + t.monto, 0);

      const gastos = transaccionesMes
        .filter(t => t.tipo === TipoTransaccion.GASTO)
        .reduce((sum, t) => sum + t.monto, 0);

      const nombreMes = fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

      meses.push({
        mes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
        ingresos,
        gastos,
        utilidad: ingresos - gastos,
        transacciones: transaccionesMes.length
      });

      fechaActual.setMonth(fechaActual.getMonth() + 1);
    }

    return meses;
  }

  private analizarDistribucionCategorias(transacciones: any[]): any[] {
    const categorias = new Map();
    const totalMonto = transacciones.reduce((sum, t) => sum + t.monto, 0);

    transacciones.forEach(t => {
      const key = `${t.categoria}-${t.tipo}`;
      if (!categorias.has(key)) {
        categorias.set(key, {
          categoria: this.formatearCategoria(t.categoria),
          tipo: t.tipo,
          monto: 0,
          transacciones: 0
        });
      }
      
      const cat = categorias.get(key);
      cat.monto += t.monto;
      cat.transacciones += 1;
    });

    return Array.from(categorias.values()).map(cat => ({
      ...cat,
      porcentaje: totalMonto > 0 ? (cat.monto / totalMonto) * 100 : 0
    })).sort((a, b) => b.monto - a.monto);
  }

  private async evaluarPerformanceFondos(usuarioId: string, fondos: any[]): Promise<any[]> {
    const performance = [];

    for (const fondo of fondos) {
      const transacciones = await this.transaccionModel.find({
        fondoId: fondo._id,
        usuarioId: new Types.ObjectId(usuarioId)
      }).exec();

      const saldoActual = fondo.saldoActual || 0;
      const metaAhorro = fondo.metaAhorro || 0;
      const progresoMeta = metaAhorro > 0 ? (saldoActual / metaAhorro) * 100 : 0;

      let rendimiento: 'excelente' | 'bueno' | 'regular' | 'malo';
      if (progresoMeta >= 90) rendimiento = 'excelente';
      else if (progresoMeta >= 70) rendimiento = 'bueno';
      else if (progresoMeta >= 40) rendimiento = 'regular';
      else rendimiento = 'malo';

      performance.push({
        nombre: fondo.nombre,
        tipo: this.formatearTipoFondo(fondo.tipo),
        saldoActual,
        metaAhorro,
        progresoMeta,
        transacciones: transacciones.length,
        rendimiento
      });
    }

    return performance.sort((a, b) => b.saldoActual - a.saldoActual);
  }

  private async calcularFlujoCaja(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<any[]> {
    const flujo = [];
    const fechaActual = new Date(fechaInicio);
    let acumulado = 0;

    while (fechaActual <= fechaFin && flujo.length < 30) { // Límite de 30 días
      const finDia = new Date(fechaActual);
      finDia.setHours(23, 59, 59, 999);

      const transaccionesDia = await this.transaccionModel.find({
        usuarioId: new Types.ObjectId(usuarioId),
        fecha: { $gte: fechaActual, $lte: finDia }
      }).exec();

      const entradas = transaccionesDia
        .filter(t => t.tipo === TipoTransaccion.INGRESO)
        .reduce((sum, t) => sum + t.monto, 0);

      const salidas = transaccionesDia
        .filter(t => t.tipo === TipoTransaccion.GASTO)
        .reduce((sum, t) => sum + t.monto, 0);

      const neto = entradas - salidas;
      acumulado += neto;

      if (entradas > 0 || salidas > 0) { // Solo incluir días con movimientos
        flujo.push({
          fecha: fechaActual.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
          entradas,
          salidas,
          neto,
          acumulado
        });
      }

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return flujo;
  }

  private formatearCategoria(categoria: string): string {
    const categorias: { [key: string]: string } = {
      'alimentacion': 'Alimentación',
      'transporte': 'Transporte',
      'entretenimiento': 'Entretenimiento',
      'salud': 'Salud',
      'educacion': 'Educación',
      'hogar': 'Hogar',
      'ropa': 'Ropa',
      'tecnologia': 'Tecnología',
      'viajes': 'Viajes',
      'salario': 'Salario',
      'freelance': 'Freelance',
      'inversiones': 'Inversiones',
      'regalos': 'Regalos',
      'otros': 'Otros'
    };
    return categorias[categoria?.toLowerCase()] || categoria || 'Otros';
  }

  private formatearTipoFondo(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'ahorro': 'Ahorro',
      'inversion': 'Inversión',
      'emergencia': 'Emergencia',
      'gastos': 'Gastos',
      'personal': 'Personal'
    };
    return tipos[tipo?.toLowerCase()] || tipo || 'Personal';
  }
}
