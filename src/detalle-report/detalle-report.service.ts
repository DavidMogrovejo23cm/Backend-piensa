import { Injectable } from '@nestjs/common';
import { CreateDetalleReportDto } from './dto/create-detalle-report.dto';
import { UpdateDetalleReportDto } from './dto/update-detalle-report.dto';

@Injectable()
export class DetalleReportService {
  create(createDetalleReportDto: CreateDetalleReportDto) {
    return 'This action adds a new detalleReport';
  }

  findAll() {
    return `This action returns all detalleReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detalleReport`;
  }

  update(id: number, updateDetalleReportDto: UpdateDetalleReportDto) {
    return `This action updates a #${id} detalleReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} detalleReport`;
  }
}
