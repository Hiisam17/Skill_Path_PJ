import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 1. Thêm dòng import này

@Module({
  imports: [PrismaModule], // 2. Thêm mảng imports có chứa PrismaModule
  providers: [ProgressService],
  controllers: [ProgressController]
})
export class ProgressModule {}