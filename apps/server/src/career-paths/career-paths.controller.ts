import { Controller, Get } from '@nestjs/common';
import { CareerPathDto } from '../types';
import { CareerPathsService } from './career-paths.service';

@Controller('career-paths')
export class CareerPathsController {
  constructor(private readonly careerPathsService: CareerPathsService) {}

  @Get()
  async findAll(): Promise<CareerPathDto[]> {
    return this.careerPathsService.findAll();
  }
}
