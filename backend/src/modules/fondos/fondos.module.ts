import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FondosService } from './fondos.service';
import { FondosController } from './fondos.controller';
import { Fondo, FondoSchema } from './schemas/fondo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Fondo.name, schema: FondoSchema }])
  ],
  controllers: [FondosController],
  providers: [FondosService],
  exports: [FondosService],
})
export class FondosModule {}
