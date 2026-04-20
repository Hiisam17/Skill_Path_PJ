import { Module } from '@nestjs/common';
import { RoadmapSectionsController } from './roadmap-sections.controller';
import { RoadmapSectionsService } from './roadmap-sections.service';
import { PrismaModule } from '../prisma/prisma.module'; 

@Module({

  imports: [PrismaModule],
  
  controllers: [RoadmapSectionsController],
  
  providers: [RoadmapSectionsService],

  exports: [RoadmapSectionsService], 
})
export class RoadmapSectionsModule {}