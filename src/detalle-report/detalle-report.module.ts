import { Module } from '@nestjs/common';
import { DetalleReportService } from './detalle-report.service';
import { DetalleReportController } from './detalle-report.controller';

@Module({
  controllers: [DetalleReportController],
  providers: [DetalleReportService],
})
export class DetalleReportModule {}
