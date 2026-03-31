import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { PrismaService } from './prisma.service';

/**
 * PrismaModule - Global infrastructure module for database access
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }