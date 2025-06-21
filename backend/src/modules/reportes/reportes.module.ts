import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportesService } from './reportes.service';
import { DiagnosticoService } from './diagnostico.service';
import { DashboardService } from './dashboard.service';
import { ReportesController } from './reportes.controller';
import { DashboardController } from './dashboard.controller';
import { ReportesUnificadoController } from './reportes-unificado.controller';
import { ReportesUnificadoService } from './reportes-unificado.service';
import { Fondo, FondoSchema } from '../fondos/schemas/fondo.schema';
import { Transaccion, TransaccionSchema } from '../transacciones/schemas/transaccion.schema';
import { FondosModule } from '../fondos/fondos.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Fondo.name, schema: FondoSchema },
      { name: Transaccion.name, schema: TransaccionSchema },
    ]),
    forwardRef(() => FondosModule),
  ],
  controllers: [
    ReportesUnificadoController, // ✅ Nuevo controlador unificado
    ReportesController, 
    DashboardController,
  ],
  providers: [
    ReportesUnificadoService, // ✅ Nuevo servicio unificado
    ReportesService,
    DiagnosticoService, // ✅ Nuevo servicio de diagnóstico
    DashboardService
  ],
  exports: [
    ReportesUnificadoService,
    ReportesService,
    DiagnosticoService, // ✅ Exportar servicio de diagnóstico
    DashboardService
  ],
})
export class ReportesModule {}
