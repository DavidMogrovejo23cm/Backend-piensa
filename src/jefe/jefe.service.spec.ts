import { Test, TestingModule } from '@nestjs/testing';
import { JefeService } from './jefe.service';

describe('JefeService', () => {
  let service: JefeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JefeService],
    }).compile();

    service = module.get<JefeService>(JefeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
