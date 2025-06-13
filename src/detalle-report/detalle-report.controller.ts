import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetalleReportService } from './detalle-report.service';
import { CreateDetalleReportDto } from './dto/create-detalle-report.dto';
import { UpdateDetalleReportDto } from './dto/update-detalle-report.dto';

@Controller('detalle-report')
export class DetalleReportController {
  constructor(private readonly detalleReportService: DetalleReportService) {}

  @Post()
  create(@Body() createDetalleReportDto: CreateDetalleReportDto) {
    return this.detalleReportService.create(createDetalleReportDto);
  }

  @Get()
  findAll() {
    return this.detalleReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleReportDto: UpdateDetalleReportDto) {
    return this.detalleReportService.update(+id, updateDetalleReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleReportService.remove(+id);
  }
}
