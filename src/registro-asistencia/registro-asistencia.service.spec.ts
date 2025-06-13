import { Test, TestingModule } from '@nestjs/testing';
import { RegistroAsistenciaService } from './registro-asistencia.service';

describe('RegistroAsistenciaService', () => {
  let service: RegistroAsistenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistroAsistenciaService],
    }).compile();

    service = module.get<RegistroAsistenciaService>(RegistroAsistenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
