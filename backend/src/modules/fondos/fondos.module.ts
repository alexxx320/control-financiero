import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FondosService } from './fondos.service';
import { FondosController } from './fondos.controller';
import { Fondo, FondoSchema } from './schemas/fondo.schema';
import { Transaccion, TransaccionSchema } from '../transacciones/schemas/transaccion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Fondo.name, schema: FondoSchema },
      { name: Transaccion.name, schema: TransaccionSchema }
    ])
  ],
  controllers: [FondosController],
  providers: [FondosService],
  exports: [FondosService],
})
export class FondosModule {}
