import { Test, TestingModule } from '@nestjs/testing';
import { QrtokenService } from './qrtoken.service';

describe('QrtokenService', () => {
  let service: QrtokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QrtokenService],
    }).compile();

    service = module.get<QrtokenService>(QrtokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
