import { Test, TestingModule } from '@nestjs/testing';
import { QrtokenController } from './qrtoken.controller';
import { QrtokenService } from './qrtoken.service';

describe('QrtokenController', () => {
  let controller: QrtokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrtokenController],
      providers: [QrtokenService],
    }).compile();

    controller = module.get<QrtokenController>(QrtokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
