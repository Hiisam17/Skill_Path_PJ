import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { PrismaService } from './prisma.service';

/**
 * Global module that provides PrismaService as a singleton across the application.
 * No explicit import is needed in other modules.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }