import { Test, TestingModule } from '@nestjs/testing';
import { DetalleReportController } from './detalle-report.controller';
import { DetalleReportService } from './detalle-report.service';

describe('DetalleReportController', () => {
  let controller: DetalleReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleReportController],
      providers: [DetalleReportService],
    }).compile();

    controller = module.get<DetalleReportController>(DetalleReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
