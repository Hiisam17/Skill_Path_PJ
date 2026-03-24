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

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CareerPathsModule,
    RoadmapsModule,
    SkillsModule,
    ProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
