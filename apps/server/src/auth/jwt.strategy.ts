import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa'; // Import thư viện mới

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);
    constructor(configService: ConfigService) {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,

            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
            }),
            algorithms: ['RS256', 'HS256'],
        });
        this.logger.debug(`JwtStrategy initialized with JWKS URI: ${supabaseUrl}/auth/v1/.well-known/jwks.json`);
    }

    async validate(payload: any) {
        try {
            this.logger.debug(`Token payload received: sub=${payload?.sub} email=${payload?.email}`);
            return { userId: payload.sub, email: payload.email, role: payload.role };
        } catch (err) {
            this.logger.error('Error while validating JWT payload', err as any);
            throw err;
        }
    }
}