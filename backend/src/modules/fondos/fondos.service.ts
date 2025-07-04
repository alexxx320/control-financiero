import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Fondo, FondoDocument } from './schemas/fondo.schema';
import { Transaccion, TransaccionDocument } from '../transacciones/schemas/transaccion.schema';
import { CreateFondoDto, UpdateFondoDto } from '@/common/dto/fondo.dto';
import { TipoTransaccion } from '@/common/interfaces/financiero.interface';

@Injectable()
export class FondosService {
  constructor(
    @InjectModel(Fondo.name) private fondoModel: Model<FondoDocument>,
    @InjectModel(Transaccion.name) private transaccionModel: Model<TransaccionDocument>,
  ) {}

  async create(createFondoDto: CreateFondoDto, usuarioId: string): Promise<Fondo> {
    console.log(`🏦 [FONDOS] Creando fondo para usuario ${usuarioId}:`, createFondoDto);
    
    // Verificar que no exista un fondo con el mismo nombre para este usuario
    const fondoExistente = await this.fondoModel.findOne({ 
      nombre: createFondoDto.nombre,
      usuarioId: new Types.ObjectId(usuarioId)
    });
    
    if (fondoExistente) {
      throw new BadRequestException(`Ya existe un fondo con el nombre "${createFondoDto.nombre}"`);
    }

    // 🔧 VALIDACIÓN ESTRICTA: Manejo de meta según tipo de fondo
    let metaAhorro = 0;
    let saldoInicial = createFondoDto.saldoActual || 0;
    
    if (createFondoDto.tipo === 'ahorro') {
      // Para fondos de ahorro, meta es OBLIGATORIA y debe ser > 0
      if (!createFondoDto.metaAhorro || createFondoDto.metaAhorro <= 0) {
        throw new BadRequestException('La meta de ahorro es obligatoria y debe ser mayor a 0 para fondos de ahorro');
      }
      metaAhorro = createFondoDto.metaAhorro;
      console.log(`🎯 [FONDOS] Fondo de ahorro con meta obligatoria: ${metaAhorro}`);
    } else if (createFondoDto.tipo === 'registro') {
      // Para fondos de registro, PROHIBIR cualquier meta
      metaAhorro = 0;
      if (createFondoDto.metaAhorro && createFondoDto.metaAhorro > 0) {
        throw new BadRequestException('Los fondos de registro no pueden tener meta de ahorro');
      }
      console.log(`📝 [FONDOS] Fondo de registro sin meta (prohibida)`);
    } else if (createFondoDto.tipo === 'prestamo') {
      // Para fondos de préstamo, meta es OBLIGATORIA (monto total del préstamo)
      if (!createFondoDto.metaAhorro || createFondoDto.metaAhorro <= 0) {
        throw new BadRequestException('La meta del préstamo es obligatoria y debe ser mayor a 0');
      }
      metaAhorro = createFondoDto.metaAhorro;
      // Para préstamos, el saldo inicial debe ser negativo (lo que se debe)
      if (saldoInicial >= 0) {
        saldoInicial = -metaAhorro; // Por defecto, el saldo inicial es el monto total que se debe
      }
      console.log(`💵 [FONDOS] Fondo de préstamo con meta: ${metaAhorro}, saldo inicial: ${saldoInicial}`);
    } else if (createFondoDto.tipo === 'deuda') {
      // Para fondos de deuda, meta es OBLIGATORIA (monto total de la deuda)
      if (!createFondoDto.metaAhorro || createFondoDto.metaAhorro <= 0) {
        throw new BadRequestException('El monto de la deuda es obligatorio y debe ser mayor a 0');
      }
      metaAhorro = createFondoDto.metaAhorro;
      // Para deudas, el saldo inicial debe ser negativo (lo que debo)
      if (saldoInicial >= 0) {
        saldoInicial = -metaAhorro; // Por defecto, el saldo inicial es el monto total que debo
      }
      console.log(`🔴 [FONDOS] Fondo de deuda con meta: ${metaAhorro}, saldo inicial: ${saldoInicial}`);
    }

    const nuevoFondo = new this.fondoModel({
      ...createFondoDto,
      usuarioId: new Types.ObjectId(usuarioId),
      saldoActual: saldoInicial,
      metaAhorro,  // Meta calculada según tipo
      fechaCreacion: new Date(),
      activo: true,
    });

    const fondoGuardado = await nuevoFondo.save();
    console.log(`✅ [FONDOS] Fondo creado exitosamente:`, {
      id: fondoGuardado._id,
      nombre: fondoGuardado.nombre,
      tipo: fondoGuardado.tipo,
      meta: fondoGuardado.metaAhorro
    });
    
    return fondoGuardado;
  }

  async findAll(usuarioId: string): Promise<Fondo[]> {
    return await this.fondoModel
      .find({ 
        usuarioId: new Types.ObjectId(usuarioId),
        activo: true 
      })
      .sort({ fechaCreacion: -1 })
      .exec();
  }

  async findOne(id: string, usuarioId: string): Promise<Fondo> {
    const fondo = await this.fondoModel.findOne({
      _id: id,
      usuarioId: new Types.ObjectId(usuarioId)
    }).exec();
    
    if (!fondo) {
      throw new NotFoundException(`Fondo con ID "${id}" no encontrado`);
    }
    
    return fondo;
  }

  async update(id: string, updateFondoDto: UpdateFondoDto, usuarioId: string): Promise<Fondo> {
    console.log(`🔄 [FONDOS] Actualizando fondo ${id}:`, updateFondoDto);
    
    // Verificar que el fondo existe y pertenece al usuario
    const fondoExistente = await this.findOne(id, usuarioId);

    // Si se está actualizando el nombre, verificar que no exista otro fondo con ese nombre
    if (updateFondoDto.nombre && updateFondoDto.nombre !== fondoExistente.nombre) {
      const nombreDuplicado = await this.fondoModel.findOne({ 
        nombre: updateFondoDto.nombre,
        usuarioId: new Types.ObjectId(usuarioId),
        _id: { $ne: id }
      });
      
      if (nombreDuplicado) {
        throw new BadRequestException(`Ya existe un fondo con el nombre "${updateFondoDto.nombre}"`);
      }
    }

    // 🔧 VALIDACIÓN ESTRICTA: Manejo de meta según tipo de fondo
    const datosActualizacion: any = { ...updateFondoDto };
    
    // Determinar el tipo final (el que se va a actualizar o el existente)
    const tipoFinal = updateFondoDto.tipo || fondoExistente.tipo;
    
    if (tipoFinal === 'registro') {
      // Para fondos de registro, PROHIBIR cualquier meta
      datosActualizacion.metaAhorro = 0;
      if (updateFondoDto.metaAhorro && updateFondoDto.metaAhorro > 0) {
        throw new BadRequestException('Los fondos de registro no pueden tener meta de ahorro');
      }
      console.log(`📝 [FONDOS] Actualizando a fondo de registro (meta prohibida)`);
    } else if (tipoFinal === 'ahorro') {
      // Para fondos de ahorro, meta es OBLIGATORIA si se está proporcionando
      if (updateFondoDto.metaAhorro !== undefined) {
        if (updateFondoDto.metaAhorro <= 0) {
          throw new BadRequestException('La meta de ahorro debe ser mayor a 0 para fondos de ahorro');
        }
        datosActualizacion.metaAhorro = updateFondoDto.metaAhorro;
      }
      console.log(`🎯 [FONDOS] Actualizando fondo de ahorro con meta: ${datosActualizacion.metaAhorro}`);
    } else if (tipoFinal === 'prestamo') {
      // Para fondos de préstamo, meta es OBLIGATORIA si se está proporcionando
      if (updateFondoDto.metaAhorro !== undefined) {
        if (updateFondoDto.metaAhorro <= 0) {
          throw new BadRequestException('La meta del préstamo debe ser mayor a 0');
        }
        datosActualizacion.metaAhorro = updateFondoDto.metaAhorro;
      }
      console.log(`💵 [FONDOS] Actualizando fondo de préstamo con meta: ${datosActualizacion.metaAhorro}`);
    } else if (tipoFinal === 'deuda') {
      // 🆕 NUEVO: Lógica especial para deudas
      if (updateFondoDto.metaAhorro !== undefined) {
        if (updateFondoDto.metaAhorro <= 0) {
          throw new BadRequestException('El monto de la deuda debe ser mayor a 0');
        }
        
        // 🔧 LÓGICA ESPECIAL: Al aumentar deuda, reiniciar progreso
        const metaAnterior = fondoExistente.metaAhorro || 0;
        const saldoAnterior = fondoExistente.saldoActual;
        const montoPagadoActual = metaAnterior + saldoAnterior; // Cuánto se ha pagado hasta ahora
        
        console.log(`🔴 [FONDOS] Editando deuda:`);
        console.log(`  - Meta anterior: ${metaAnterior}`);
        console.log(`  - Saldo anterior: ${saldoAnterior}`);
        console.log(`  - Monto pagado actual: ${montoPagadoActual}`);
        console.log(`  - Nueva meta: ${updateFondoDto.metaAhorro}`);
        
        if (updateFondoDto.metaAhorro > metaAnterior) {
          // 🆕 CASO: AUMENTAR DEUDA (nuevo préstamo)
          // Reiniciar progreso - la nueva meta es el objetivo completo
          console.log(`📈 Aumentando deuda: ${metaAnterior} → ${updateFondoDto.metaAhorro}`);
          console.log(`🔄 Reiniciando progreso - nueva deuda completa: ${updateFondoDto.metaAhorro}`);
          
          datosActualizacion.saldoActual = -updateFondoDto.metaAhorro; // Deuda completa
          
          console.log(`  - Nuevo saldo: ${datosActualizacion.saldoActual} (deuda completa)`);
          console.log(`  - Progreso reiniciado: 0% de ${updateFondoDto.metaAhorro}`);
        } else if (updateFondoDto.metaAhorro < metaAnterior) {
          // 📉 CASO: DISMINUIR DEUDA (descuento/condonación)
          // Mantener el monto pagado si es posible
          console.log(`📉 Disminuyendo deuda: ${metaAnterior} → ${updateFondoDto.metaAhorro}`);
          
          if (montoPagadoActual >= updateFondoDto.metaAhorro) {
            // Ya se pagó más de lo que ahora se debe
            console.log(`✅ Deuda totalmente pagada (pagado: ${montoPagadoActual}, nueva meta: ${updateFondoDto.metaAhorro})`);
            datosActualizacion.saldoActual = 0;
          } else {
            // Mantener progreso proporcional
            const nuevaDeudaPendiente = updateFondoDto.metaAhorro - montoPagadoActual;
            datosActualizacion.saldoActual = -nuevaDeudaPendiente;
            console.log(`  - Manteniendo monto pagado: ${montoPagadoActual}`);
            console.log(`  - Nueva deuda pendiente: ${nuevaDeudaPendiente}`);
          }
        } else {
          // 🔄 CASO: MISMA META (solo actualización de otros campos)
          console.log(`🔄 Meta sin cambios: ${metaAnterior}`);
          // No cambiar el saldo
        }
        
        datosActualizacion.metaAhorro = updateFondoDto.metaAhorro;
      }
    }

    const fondoActualizado = await this.fondoModel
      .findOneAndUpdate(
        { _id: id, usuarioId: new Types.ObjectId(usuarioId) },
        datosActualizacion, 
        { new: true }
      )
      .exec();

    console.log(`✅ [FONDOS] Fondo actualizado exitosamente:`, {
      id: fondoActualizado._id,
      nombre: fondoActualizado.nombre,
      tipo: fondoActualizado.tipo,
      meta: fondoActualizado.metaAhorro
    });

    return fondoActualizado;
  }

  async remove(id: string, usuarioId: string): Promise<void> {
    console.log(`🗑️ Eliminando fondo ${id} y sus transacciones asociadas...`);
    
    // Verificar que el fondo existe
    const fondo = await this.findOne(id, usuarioId);
    
    // Contar transacciones asociadas
    const transaccionesCount = await this.transaccionModel.countDocuments({ 
      fondoId: new Types.ObjectId(id),
      usuarioId: new Types.ObjectId(usuarioId)
    });
    
    if (transaccionesCount > 0) {
      console.log(`📋 Eliminando ${transaccionesCount} transacción(es) asociadas al fondo "${fondo.nombre}"...`);
      
      // Eliminar todas las transacciones asociadas al fondo
      await this.transaccionModel.deleteMany({
        fondoId: new Types.ObjectId(id),
        usuarioId: new Types.ObjectId(usuarioId)
      }).exec();
      
      console.log(`✅ ${transaccionesCount} transacción(es) eliminadas`);
    }
    
    // Eliminar el fondo
    await this.fondoModel
      .findOneAndDelete({
        _id: id, 
        usuarioId: new Types.ObjectId(usuarioId)
      })
      .exec();
      
    console.log(`✅ Fondo "${fondo.nombre}" eliminado exitosamente`);
  }

  async findByTipo(tipo: string, usuarioId: string): Promise<Fondo[]> {
    return await this.fondoModel
      .find({ 
        tipo, 
        usuarioId: new Types.ObjectId(usuarioId),
        activo: true 
      })
      .sort({ fechaCreacion: -1 })
      .exec();
  }

  async getTotalFondos(usuarioId: string): Promise<number> {
    return await this.fondoModel.countDocuments({ 
      usuarioId: new Types.ObjectId(usuarioId),
      activo: true 
    });
  }

  async getFondosConMetas(usuarioId: string): Promise<Fondo[]> {
    return await this.fondoModel
      .find({ 
        usuarioId: new Types.ObjectId(usuarioId),
        activo: true,
        metaAhorro: { $gt: 0 }
      })
      .sort({ metaAhorro: -1 })
      .exec();
  }

  /**
   * Actualizar saldo del fondo cuando hay transacciones
   */
  async actualizarSaldo(fondoId: string, tipo: TipoTransaccion, monto: number, usuarioId: string): Promise<Fondo> {
    const fondo = await this.findOne(fondoId, usuarioId);
    
    let nuevoSaldo: number;
    
    // 🔧 CORREGIDO FINAL: Lógica correcta para deudas según requerimiento
    if (fondo.tipo === 'deuda') {
      // Para DEUDAS: Lógica específica del negocio
      // - INGRESO (nueva deuda): Aumenta total deuda Y saldo negativo ✅
      // - GASTO (pago de deuda): Solo mejora saldo (acerca a 0) ✅
      if (tipo === TipoTransaccion.INGRESO) {
        // 💳 NUEVA DEUDA ADQUIRIDA: Aumentar total deuda Y empeorar saldo
        nuevoSaldo = fondo.saldoActual - monto; // Empeora el saldo (más negativo)
        const nuevaMeta = fondo.metaAhorro + monto; // Aumenta total deuda
        console.log(`💳 DEUDA - Nueva deuda adquirida: ${monto}, saldo anterior: ${fondo.saldoActual}, nuevo saldo: ${nuevoSaldo}`);
        console.log(`🎯 DEUDA - Total deuda actualizado: ${fondo.metaAhorro} → ${nuevaMeta}`);
        
        // Actualizar tanto saldo como meta
        return await this.fondoModel
          .findOneAndUpdate(
            { _id: fondoId, usuarioId: new Types.ObjectId(usuarioId) },
            { 
              saldoActual: nuevoSaldo,
              metaAhorro: nuevaMeta
            },
            { new: true }
          )
          .exec();
          
      } else if (tipo === TipoTransaccion.GASTO) {
        // 💰 PAGO DE DEUDA: Solo mejorar saldo (acercar a 0), meta se mantiene
        nuevoSaldo = fondo.saldoActual + monto; // Mejora el saldo (menos negativo)
        console.log(`💰 DEUDA - Pago realizado: ${monto}, saldo anterior: ${fondo.saldoActual}, nuevo saldo: ${nuevoSaldo}`);
        console.log(`🎯 DEUDA - Total deuda se mantiene: ${fondo.metaAhorro} (sin cambios)`);
        
        // Solo actualizar el saldo, mantener la meta igual
        return await this.fondoModel
          .findOneAndUpdate(
            { _id: fondoId, usuarioId: new Types.ObjectId(usuarioId) },
            { saldoActual: nuevoSaldo }, // Solo cambiar saldo
            { new: true }
          )
          .exec();
      } else {
        throw new BadRequestException(`Tipo de transacción no válido para actualizar saldo de deuda: ${tipo}`);
      }
    } else {
      // Para FONDOS NORMALES (registro, ahorro, préstamo): Lógica NORMAL
      // - INGRESO: Aumenta el saldo
      // - GASTO: Disminuye el saldo
      if (tipo === TipoTransaccion.INGRESO) {
        nuevoSaldo = fondo.saldoActual + monto;
      } else if (tipo === TipoTransaccion.GASTO) {
        nuevoSaldo = fondo.saldoActual - monto;
      } else {
        throw new BadRequestException(`Tipo de transacción no válido para actualizar saldo: ${tipo}`);
      }
      
      // Permitir saldos negativos pero registrar la situación para fondos que no sean deuda o préstamo
      if (nuevoSaldo < 0 && fondo.tipo !== 'prestamo') {
        console.warn(`⚠️ Saldo negativo en fondo "${fondo.nombre}" (tipo: ${fondo.tipo}): ${nuevoSaldo}`);
      }
      
      console.log(`🔄 Actualizando saldo de fondo "${fondo.nombre}" (${fondo.tipo}): ${fondo.saldoActual} → ${nuevoSaldo}`);
      
      // Para fondos normales, solo actualizar saldo
      return await this.fondoModel
        .findOneAndUpdate(
          { _id: fondoId, usuarioId: new Types.ObjectId(usuarioId) },
          { saldoActual: nuevoSaldo },
          { new: true }
        )
        .exec();
    }
  }

  /**
   * Obtener estadísticas personalizadas para el dashboard
   */
  async getEstadisticasPersonalizadas(usuarioId: string): Promise<{
    totalFondos: number;
    fondosActivos: number;
    fondosConMetas: number;
    metaPromedioAhorro: number;
    saldoTotalActual: number;
    fondoMayorSaldo: { nombre: string; saldo: number } | null;
    progresoPromedioMetas: number;
  }> {
    const fondos = await this.fondoModel
      .find({ 
        usuarioId: new Types.ObjectId(usuarioId)
      })
      .exec();

    const fondosActivos = fondos.filter(f => f.activo);
    const fondosConMetas = fondosActivos.filter(f => f.metaAhorro && f.metaAhorro > 0);
    
    const saldoTotal = fondosActivos.reduce((sum, f) => sum + f.saldoActual, 0);
    const metaPromedio = fondosConMetas.length > 0 
      ? fondosConMetas.reduce((sum, f) => sum + f.metaAhorro, 0) / fondosConMetas.length 
      : 0;

    // Encontrar fondo con mayor saldo
    let fondoMayorSaldo = null;
    if (fondosActivos.length > 0) {
      const fondoMaximo = fondosActivos.reduce((prev, current) => 
        prev.saldoActual > current.saldoActual ? prev : current
      );
      fondoMayorSaldo = {
        nombre: fondoMaximo.nombre,
        saldo: fondoMaximo.saldoActual
      };
    }

    // Calcular progreso promedio de metas (incluyendo lógica de préstamos)
    let progresoPromedio = 0;
    if (fondosConMetas.length > 0) {
      const progresoTotal = fondosConMetas.reduce((sum, f) => {
        let progreso: number;
        if (f.tipo === 'prestamo') {
          // Para préstamos: progreso = (monto_pagado / monto_total) * 100
          // Si saldo es -100000 y meta es 100000, entonces se ha pagado 0 (progreso = 0%)
          // Si saldo es 0 y meta es 100000, entonces se ha pagado todo (progreso = 100%)
          const montoPagado = f.metaAhorro + f.saldoActual; // saldo negativo + meta positiva
          progreso = (montoPagado / f.metaAhorro) * 100;
        } else if (f.tipo === 'deuda') {
          // Para deudas: misma lógica que préstamos (saldo negativo que se acerca a 0)
          const montoPagado = f.metaAhorro + f.saldoActual; // saldo negativo + meta positiva
          progreso = (montoPagado / f.metaAhorro) * 100;
        } else {
          // Para fondos normales de ahorro
          progreso = (f.saldoActual / f.metaAhorro) * 100;
        }
        return sum + Math.min(Math.max(progreso, 0), 100); // Entre 0% y 100%
      }, 0);
      progresoPromedio = progresoTotal / fondosConMetas.length;
    }

    return {
      totalFondos: fondos.length,
      fondosActivos: fondosActivos.length,
      fondosConMetas: fondosConMetas.length,
      metaPromedioAhorro: metaPromedio,
      saldoTotalActual: saldoTotal,
      fondoMayorSaldo,
      progresoPromedioMetas: Math.round(progresoPromedio * 100) / 100
    };
  }

  /**
   * Obtener estadísticas específicas para préstamos
   */
  async getEstadisticasPrestamos(usuarioId: string): Promise<{
    totalPrestamos: number;
    prestamosActivos: number;
    montoTotalPrestado: number;
    montoTotalPagado: number;
    montoTotalPendiente: number;
    progresoPromedioPagos: number;
  }> {
    const prestamos = await this.fondoModel
      .find({ 
        usuarioId: new Types.ObjectId(usuarioId),
        tipo: 'prestamo',
        activo: true
      })
      .exec();

    const prestamosActivos = prestamos.filter(p => p.saldoActual < 0);
    const montoTotalPrestado = prestamos.reduce((sum, p) => sum + p.metaAhorro, 0);
    
    let montoTotalPagado = 0;
    let montoTotalPendiente = 0;
    
    prestamos.forEach(prestamo => {
      const montoPagado = prestamo.metaAhorro + prestamo.saldoActual; // saldo negativo + meta positiva
      const montoPendiente = Math.abs(prestamo.saldoActual);
      
      montoTotalPagado += Math.max(montoPagado, 0);
      montoTotalPendiente += montoPendiente;
    });

    const progresoPromedio = prestamos.length > 0 
      ? (montoTotalPagado / montoTotalPrestado) * 100 
      : 0;

    return {
      totalPrestamos: prestamos.length,
      prestamosActivos: prestamosActivos.length,
      montoTotalPrestado,
      montoTotalPagado,
      montoTotalPendiente,
      progresoPromedioPagos: Math.round(progresoPromedio * 100) / 100
    };
  }

  /**
   * Calcular progreso de pago de un préstamo específico
   */
  getProgresoPrestamo(prestamo: Fondo): {
    porcentajePagado: number;
    montoPagado: number;
    montoPendiente: number;
    estaCompletado: boolean;
  } {
    if (prestamo.tipo !== 'prestamo') {
      throw new BadRequestException('Esta función solo es válida para fondos tipo préstamo');
    }

    const montoPagado = prestamo.metaAhorro + prestamo.saldoActual; // Cuanto se ha pagado
    const montoPendiente = Math.abs(prestamo.saldoActual); // Cuanto falta por pagar
    const porcentajePagado = (montoPagado / prestamo.metaAhorro) * 100;
    const estaCompletado = prestamo.saldoActual >= 0;

    return {
      porcentajePagado: Math.max(0, Math.min(100, porcentajePagado)),
      montoPagado: Math.max(0, montoPagado),
      montoPendiente,
      estaCompletado
    };
  }

  /**
   * Obtener estadísticas específicas para deudas
   */
  async getEstadisticasDeudas(usuarioId: string): Promise<{
    totalDeudas: number;
    deudasActivas: number;
    montoTotalDebe: number;
    montoTotalPagado: number;
    montoTotalPendiente: number;
    progresoPromedioPagos: number;
  }> {
    const deudas = await this.fondoModel
      .find({ 
        usuarioId: new Types.ObjectId(usuarioId),
        tipo: 'deuda',
        activo: true
      })
      .exec();

    const deudasActivas = deudas.filter(d => d.saldoActual < 0);
    const montoTotalDebe = deudas.reduce((sum, d) => sum + d.metaAhorro, 0);
    
    let montoTotalPagado = 0;
    let montoTotalPendiente = 0;
    
    deudas.forEach(deuda => {
      const montoPagado = deuda.metaAhorro + deuda.saldoActual; // saldo negativo + meta positiva
      const montoPendiente = Math.abs(deuda.saldoActual);
      
      montoTotalPagado += Math.max(montoPagado, 0);
      montoTotalPendiente += montoPendiente;
    });

    const progresoPromedio = deudas.length > 0 
      ? (montoTotalPagado / montoTotalDebe) * 100 
      : 0;

    return {
      totalDeudas: deudas.length,
      deudasActivas: deudasActivas.length,
      montoTotalDebe,
      montoTotalPagado,
      montoTotalPendiente,
      progresoPromedioPagos: Math.round(progresoPromedio * 100) / 100
    };
  }

  /**
   * Calcular progreso de pago de una deuda específica
   */
  getProgresoDeuda(deuda: Fondo): {
    porcentajePagado: number;
    montoPagado: number;
    montoPendiente: number;
    estaLiquidada: boolean;
  } {
    if (deuda.tipo !== 'deuda') {
      throw new BadRequestException('Esta función solo es válida para fondos tipo deuda');
    }

    const montoPagado = deuda.metaAhorro + deuda.saldoActual; // Cuanto se ha pagado
    const montoPendiente = Math.abs(deuda.saldoActual); // Cuanto falta por pagar
    const porcentajePagado = (montoPagado / deuda.metaAhorro) * 100;
    const estaLiquidada = deuda.saldoActual >= 0;

    return {
      porcentajePagado: Math.max(0, Math.min(100, porcentajePagado)),
      montoPagado: Math.max(0, montoPagado),
      montoPendiente,
      estaLiquidada
    };
  }
}
