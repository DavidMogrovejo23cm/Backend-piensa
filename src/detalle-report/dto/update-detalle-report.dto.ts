import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleReportDto } from './create-detalle-report.dto';

export class UpdateDetalleReportDto extends PartialType(CreateDetalleReportDto) {}
