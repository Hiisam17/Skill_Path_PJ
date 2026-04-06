import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL') || process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is missing. Create apps/server/.env from .env.example first.',
      );
    }

    if (connectionString.includes('<') || connectionString.includes('>')) {
      throw new Error(
        'DATABASE_URL in apps/server/.env is still a placeholder. Replace it with a real PostgreSQL/Supabase connection string.',
      );
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    });

    this.pool = pool;
    this.logger.log('--- 🛡️ GIÁM ĐỊNH TẠI PRISMA SERVICE ---');
    this.logger.log('✅ Đã cấu hình Driver Adapter thành công!');
  }

  /**
   * Connect to database when module initializes
   * Called automatically by NestJS after dependency injection setup
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (e) {
      this.logger.error('❌ Database connection failed', e);
      throw e;
    }
  }

  /**
   * Disconnect from database when module is destroyed
   * Ensures graceful shutdown with proper resource cleanup
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      await this.pool.end();
      this.logger.log('Database disconnected successfully');
    } catch (error) {
      this.logger.error('Failed to disconnect from database', error);
    }
  }
}