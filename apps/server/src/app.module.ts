import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CareerPathsModule } from './career-paths/career-paths.module';
import { RoadmapsModule } from './roadmaps/roadmaps.module';
import { SkillsModule } from './skills/skills.module';
import { ProgressModule } from './progress/progress.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { RoadmapSectionsModule } from './roadmap-sections/roadmap-sections.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env.development'), 
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    CareerPathsModule,
    RoadmapsModule,
    SkillsModule,
    ProgressModule,
    RoadmapSectionsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }