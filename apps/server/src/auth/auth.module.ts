import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
// Import PrismaModule nếu bạn chưa cấu hình nó là Global Module
import { PrismaModule } from '../prisma/prisma.module'; 

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule, // Bắt buộc phải có để AuthService gọi được this.prisma
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Khai báo Strategy ở đây
  exports: [AuthService],
})
export class AuthModule {}