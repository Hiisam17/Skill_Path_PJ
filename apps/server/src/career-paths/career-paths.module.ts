import { Module } from '@nestjs/common';
import { CareerPathsService } from './career-paths.service';
import { CareerPathsController } from './career-paths.controller';

@Module({
  providers: [CareerPathsService],
  controllers: [CareerPathsController],
})
export class CareerPathsModule {}
