"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticoService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const fondo_schema_1 = require("../fondos/schemas/fondo.schema");
const transaccion_schema_1 = require("../transacciones/schemas/transaccion.schema");
let DiagnosticoService = class DiagnosticoService {
    constructor(fondoModel, transaccionModel) {
        this.fondoModel = fondoModel;
        this.transaccionModel = transaccionModel;
    }
    async diagnosticarSistema() {
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
            console.log('🔍 Verificando consistencia...');
            const usuariosSinFondos = usuariosTransacciones.filter(u => !usuariosFondos.includes(u));
            if (usuariosSinFondos.length > 0) {
                diagnostico.problemas.push(`Usuarios con transacciones pero sin fondos: ${usuariosSinFondos.length}`);
            }
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
            }
            else {
                console.log('✅ No se encontraron problemas críticos');
            }
            return diagnostico;
        }
        catch (error) {
            console.error('❌ Error durante el diagnóstico:', error);
            diagnostico.problemas.push(`Error durante el diagnóstico: ${error.message}`);
            return diagnostico;
        }
    }
    async generarReporteDiagnostico(usuarioId) {
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
        }
        catch (error) {
            console.error('❌ Error al generar reporte de usuario:', error);
            throw error;
        }
    }
};
exports.DiagnosticoService = DiagnosticoService;
exports.DiagnosticoService = DiagnosticoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(fondo_schema_1.Fondo.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaccion_schema_1.Transaccion.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DiagnosticoService);
//# sourceMappingURL=diagnostico.service.js.map