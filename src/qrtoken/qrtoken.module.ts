import { Module } from '@nestjs/common';
import { QrtokenService } from './qrtoken.service';
import { QrtokenController } from './qrtoken.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [QrtokenController],
  providers: [QrtokenService, PrismaService],
})
export class QrtokenModule {}