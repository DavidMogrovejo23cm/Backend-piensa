import { Test, TestingModule } from '@nestjs/testing';
import { DetalleReportService } from './detalle-report.service';

describe('DetalleReportService', () => {
  let service: DetalleReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleReportService],
    }).compile();

    service = module.get<DetalleReportService>(DetalleReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
