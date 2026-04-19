import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  async analyze(
    @Body('jdText') jdText: string,
    @Body('validNodeIds') validNodeIds: string[],
  ) {
    return this.aiService.analyzeJobDescription(jdText, validNodeIds);
  }
}
