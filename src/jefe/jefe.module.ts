import { Module } from '@nestjs/common';
import { JefeService } from './jefe.service';
import { JefeController } from './jefe.controller';

@Module({
  controllers: [JefeController],
  providers: [JefeService],
})
export class JefeModule {}
