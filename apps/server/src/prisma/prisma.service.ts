import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg'; // Import thư viện pg
import { PrismaPg } from '@prisma/adapter-pg'; // Import Adapter của Prisma

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    const url = config.get<string>('DATABASE_URL');

    if (!url) {
      throw new Error('❌ DATABASE_URL is missing in .env!');
    }

    // 1. Khởi tạo một Pool kết nối từ chuỗi URL của Supabase
    const pool = new Pool({ connectionString: url });

    // 2. Tạo Adapter kết nối giữa Prisma và thư viện pg
    const adapter = new PrismaPg(pool);

    // 3. Truyền ĐÚNG thuộc tính "adapter" mà Prisma 7 yêu cầu
    super({ adapter }); 

    this.logger.log('--- 🛡️ GIÁM ĐỊNH TẠI PRISMA SERVICE ---');
    this.logger.log('✅ Đã cấu hình Driver Adapter thành công!');
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (e) {
      this.logger.error('❌ Database connection failed', e);
      throw e;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}