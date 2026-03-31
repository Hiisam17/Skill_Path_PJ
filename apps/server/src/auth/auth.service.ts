import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService) {
    // Khởi tạo Supabase client ở Backend
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  // 1. Hàm Đăng ký
  async register(email: string, password: string, name?: string) {
    this.logger.debug(`Register attempt for email=${email}`);

    // 1. Tạo tài khoản bên Supabase (Supabase tự lo email và password)
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      this.logger.warn(`Supabase signUp failed for ${email}: ${error.message}`);
      throw new BadRequestException(error.message);
    }

    // 2. Chỉ đồng bộ ID (và Name) sang Profile của Prisma
    if (data.user) {
      try {
        await this.prisma.profile.create({
          data: {
            userId: data.user.id,   // Chỉ lấy ID
            fullName: name || null, // Và lấy tên (nếu có)
          },
        });
        this.logger.debug(`Profile created in DB for userId=${data.user.id}`);
      } catch (dbError:any) {
        console.error('❌ Lỗi Prisma chi tiết:', dbError.code, dbError.message);
      throw new InternalServerErrorException('Lỗi đồng bộ hồ sơ: ' + dbError.message);
      }
    } else {
      this.logger.warn(`Supabase returned no user during signUp for ${email}`);
    }

    return {
      message: 'Đăng ký thành công!',
      user: data.user,
    };
  }

  // 2. Hàm Đăng nhập
  async login(email: string, password: string) {
    this.logger.debug(`Login attempt for email=${email}`);
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.logger.warn(`Supabase signInWithPassword failed for ${email}: ${error.message}`);
      throw new UnauthorizedException('Sai email hoặc mật khẩu!');
    }

    if (!data || !data.session) {
      this.logger.error(`No session returned from Supabase for ${email}. data=${JSON.stringify(data)}`);
      throw new InternalServerErrorException('Đăng nhập thất bại: không nhận được session.');
    }

    this.logger.debug(`Login successful for email=${email}, userId=${data.user?.id}`);

    // Trả về chuỗi JWT (Access Token) cho Frontend
    return {
      access_token: data.session.access_token,
      user: data.user,
    };
  }
}