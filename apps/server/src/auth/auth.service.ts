import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Manages user authentication via Supabase Auth.
 * Handles registration (with Prisma profile sync) and login flows.
 */
@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  /**
   * Registers a new user via Supabase Auth and syncs a profile to the local database.
   *
   * @param email - The user's email address.
   * @param password - The user's chosen password.
   * @param name - Optional display name for the profile.
   * @returns Success message and the created Supabase user.
   * @throws BadRequestException if Supabase signup fails (e.g., duplicate email).
   * @throws InternalServerErrorException if profile sync to local DB fails.
   */
  async register(email: string, password: string, name?: string) {
    this.logger.debug(`Register attempt for email=${email}`);

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      this.logger.warn(`Supabase signUp failed for ${email}: ${error.message}`);
      throw new BadRequestException(error.message);
    }

    // Sync the Supabase user ID and name to the local Prisma profile table.
    if (data.user) {
      try {
        await this.prisma.profile.upsert({
          where: { userId: data.user.id },
          update: {
            fullName: name || null,
            isDeleted: false,
            updatedAt: new Date(),
          },
          create: {
            userId: data.user.id,
            fullName: name || null,
          },
        });
        this.logger.debug(`Profile created in DB for userId=${data.user.id}`);
      } catch (dbError: any) {
        this.logger.error('Profile sync failed:', dbError.code, dbError.message);
        throw new InternalServerErrorException('Profile sync error: ' + dbError.message);
      }
    } else {
      this.logger.warn(`Supabase returned no user during signUp for ${email}`);
    }

    return {
      message: 'Registration successful!',
      user: data.user,
    };
  }

  /**
   * Authenticates a user via Supabase and returns a JWT access token.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns An object containing the JWT access token and user data.
   * @throws UnauthorizedException if credentials are invalid.
   * @throws InternalServerErrorException if Supabase doesn't return a session.
   */
  async login(email: string, password: string) {
    this.logger.debug(`Login attempt for email=${email}`);
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.logger.warn(`Supabase signInWithPassword failed for ${email}: ${error.message}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!data || !data.session) {
      this.logger.error(`No session returned from Supabase for ${email}. data=${JSON.stringify(data)}`);
      throw new InternalServerErrorException('Login failed: no session received.');
    }

    this.logger.debug(`Login successful for email=${email}, userId=${data.user?.id}`);

    // Fetch additional profile info from the local database
    const profile = await this.prisma.profile.findUnique({
      where: { userId: data.user.id },
      select: { fullName: true, avatarUrl: true, bio: true, githubLink: true }
    });

    return {
      access_token: data.session.access_token,
      user: {
        ...data.user,
        fullName: profile?.fullName || null,
        avatarUrl: profile?.avatarUrl || null,
        bio: profile?.bio || null,
        githubLink: profile?.githubLink || null,
      },
    };
  }
}
