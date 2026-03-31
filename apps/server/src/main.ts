import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';

async function bootstrap() {
  // Tải .env thủ công để debug — cwd() khi chạy từ apps/server là thư mục đó
  const envPath = join(process.cwd(), '.env');
  const result = dotenv.config({ path: envPath });

  console.log('--- 🛡️ GIÁM ĐỊNH LỖI ENV ---');
  console.log('Đường dẫn file đang tìm:', envPath);
  console.log('Kết quả đọc file:', result.error ? 'THẤT BẠI ❌' : 'THÀNH CÔNG ✅');
  console.log('Giá trị DATABASE_URL:', process.env.DATABASE_URL ? `Đã thấy (${process.env.DATABASE_URL.length} ký tự)` : 'VẪN TRỐNG ❗');

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Trong môi trường dev, cho phép mọi nguồn. (Khi lên production sẽ cấu hình chặt hơn)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  // Giả sử BE của bạn chạy ở port 3001
  await app.listen(3001); 
  console.log('🚀 Backend đang chạy tại: http://localhost:3001');
}
bootstrap();