import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Fondo, FondoDocument } from '../fondos/schemas/fondo.schema';
import { Transaccion, TransaccionDocument } from '../transacciones/schemas/transaccion.schema';

@Injectable()
export class DiagnosticoService {
  constructor(
    @InjectModel(Fondo.name) private fondoModel: Model<FondoDocument>,
    @InjectModel(Transaccion.name) private transaccionModel: Model<TransaccionDocument>,
  ) {}

  async diagnosticarSistema(): Promise<any> {
    console.log('🔍 INICIANDO DIAGNÓSTICO DEL SISTEMA DE REPORTES');
    console.log('=================================================');

    const diagnostico = {
      timestamp: new Date().toISOString(),
      fondos: {
        total: 0,
        activos: 0,
        usuarios: []
      },
      transacciones: {
        total: 0,
        ingresos: 0,
        gastos: 0,
        usuarios: []
      },
      problemas: []
    };

    try {
      // Verificar fondos
      console.log('📊 Verificando fondos...');
      const fondos = await this.fondoModel.find({}).exec();
      diagnostico.fondos.total = fondos.length;
      diagnostico.fondos.activos = fondos.filter(f => f.activo).length;
      
      const usuariosFondos = [...new Set(fondos.map(f => f.usuarioId.toString()))];
      diagnostico.fondos.usuarios = usuariosFondos;
      
      console.log(`✅ Fondos encontrados: ${diagnostico.fondos.total} (${diagnostico.fondos.activos} activos)`);
      console.log(`👥 Usuarios con fondos: ${usuariosFondos.length}`);
      
      if (diagnostico.fondos.total === 0) {
        diagnostico.problemas.push('No hay fondos creados en el sistema');
      }

      // Verificar transacciones
      console.log('💰 Verificando transacciones...');
      const transacciones = await this.transaccionModel.find({}).exec();
      diagnostico.transacciones.total = transacciones.length;
      diagnostico.transacciones.ingresos = transacciones.filter(t => t.tipo === 'ingreso').length;
      diagnostico.transacciones.gastos = transacciones.filter(t => t.tipo === 'gasto').length;
      
      const usuariosTransacciones = [...new Set(transacciones.map(t => t.usuarioId.toString()))];
      diagnostico.transacciones.usuarios = usuariosTransacciones;
      
      console.log(`✅ Transacciones encontradas: ${diagnostico.transacciones.total}`);
      console.log(`📈 Ingresos: ${diagnostico.transacciones.ingresos}, Gastos: ${diagnostico.transacciones.gastos}`);
      console.log(`👥 Usuarios con transacciones: ${usuariosTransacciones.length}`);
      
      if (diagnostico.transacciones.total === 0) {
        diagnostico.problemas.push('No hay transacciones registradas en el sistema');
      }

      // Verificar consistencia
      console.log('🔍 Verificando consistencia...');
      
      // Verificar que usuarios con transacciones tengan fondos
      const usuariosSinFondos = usuariosTransacciones.filter(u => !usuariosFondos.includes(u));
      if (usuariosSinFondos.length > 0) {
        diagnostico.problemas.push(`Usuarios con transacciones pero sin fondos: ${usuariosSinFondos.length}`);
      }
      
      // Verificar transacciones huérfanas
      const fondosIds = fondos.map(f => f._id.toString());
      const transaccionesHuerfanas = transacciones.filter(t => !fondosIds.includes(t.fondoId.toString()));
      if (transaccionesHuerfanas.length > 0) {
        diagnostico.problemas.push(`Transacciones sin fondo asociado: ${transaccionesHuerfanas.length}`);
      }

      console.log('📋 RESUMEN DEL DIAGNÓSTICO:');
      console.log(`• Fondos: ${diagnostico.fondos.total} total, ${diagnostico.fondos.activos} activos`);
      console.log(`• Transacciones: ${diagnostico.transacciones.total} total`);
      console.log(`• Usuarios únicos: ${Math.max(usuariosFondos.length, usuariosTransacciones.length)}`);
      console.log(`• Problemas detectados: ${diagnostico.problemas.length}`);
      
      if (diagnostico.problemas.length > 0) {
        console.log('⚠️ PROBLEMAS ENCONTRADOS:');
        diagnostico.problemas.forEach((problema, index) => {
          console.log(`  ${index + 1}. ${problema}`);
        });
      } else {
        console.log('✅ No se encontraron problemas críticos');
      }

      return diagnostico;
    } catch (error) {
      console.error('❌ Error durante el diagnóstico:', error);
      diagnostico.problemas.push(`Error durante el diagnóstico: ${error.message}`);
      return diagnostico;
    }
  }

  async generarReporteDiagnostico(usuarioId: string): Promise<any> {
    console.log(`🔍 Diagnóstico específico para usuario: ${usuarioId}`);
    
    try {
      const fondosUsuario = await this.fondoModel.find({ usuarioId }).exec();
      const transaccionesUsuario = await this.transaccionModel.find({ usuarioId }).exec();
      
      const reporte = {
        usuarioId,
        fondos: {
          total: fondosUsuario.length,
          activos: fondosUsuario.filter(f => f.activo).length,
          detalle: fondosUsuario.map(f => ({
            id: f._id,
            nombre: f.nombre,
            saldoActual: f.saldoActual,
            activo: f.activo
          }))
        },
        transacciones: {
          total: transaccionesUsuario.length,
          ingresos: transaccionesUsuario.filter(t => t.tipo === 'ingreso').length,
          gastos: transaccionesUsuario.filter(t => t.tipo === 'gasto').length,
          montoTotal: transaccionesUsuario.reduce((sum, t) => {
            return sum + (t.tipo === 'ingreso' ? t.monto : -t.monto);
          }, 0)
        }
      };
      
      console.log('📊 Reporte de usuario generado:', reporte);
      return reporte;
    } catch (error) {
      console.error('❌ Error al generar reporte de usuario:', error);
      throw error;
    }
  }
}
