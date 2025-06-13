import { Module } from '@nestjs/common';
import { RegistroAsistenciaService } from './registro-asistencia.service';
import { RegistroAsistenciaController } from './registro-asistencia.controller';

@Module({
  controllers: [RegistroAsistenciaController],
  providers: [RegistroAsistenciaService],
})
export class RegistroAsistenciaModule {}
