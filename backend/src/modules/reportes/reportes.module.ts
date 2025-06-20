import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportesService } from './reportes.service';
import { DashboardService } from './dashboard.service';
import { ReportesController } from './reportes.controller';
import { DashboardController } from './dashboard.controller';
import { Fondo, FondoSchema } from '../fondos/schemas/fondo.schema';
import { Transaccion, TransaccionSchema } from '../transacciones/schemas/transaccion.schema';
import { FondosModule } from '../fondos/fondos.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Fondo.name, schema: FondoSchema },
      { name: Transaccion.name, schema: TransaccionSchema },
    ]),
    // Importar FondosModule para usar FondosService
    forwardRef(() => FondosModule),
  ],
  controllers: [
    ReportesController,
    DashboardController, // Nuevo controlador para el dashboard
  ],
  providers: [ReportesService, DashboardService],
  exports: [ReportesService, DashboardService],
})
export class ReportesModule {}
