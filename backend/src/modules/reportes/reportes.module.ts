import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Fondo, FondoSchema } from '../fondos/schemas/fondo.schema';
import { Transaccion, TransaccionSchema } from '../transacciones/schemas/transaccion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Fondo.name, schema: FondoSchema },
      { name: Transaccion.name, schema: TransaccionSchema },
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
