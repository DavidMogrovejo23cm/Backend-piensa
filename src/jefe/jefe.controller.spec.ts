import { Test, TestingModule } from '@nestjs/testing';
import { JefeController } from './jefe.controller';
import { JefeService } from './jefe.service';

describe('JefeController', () => {
  let controller: JefeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JefeController],
      providers: [JefeService],
    }).compile();

    controller = module.get<JefeController>(JefeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
