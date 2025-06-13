import { Module } from '@nestjs/common';
import { QrtokenService } from './qrtoken.service';
import { QrtokenController } from './qrtoken.controller';

@Module({
  controllers: [QrtokenController],
  providers: [QrtokenService],
})
export class QrtokenModule {}
