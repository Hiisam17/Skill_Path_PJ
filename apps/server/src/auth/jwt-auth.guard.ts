// apps/server/src/auth/jwt-auth.guard.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	private readonly logger = new Logger(JwtAuthGuard.name);

	handleRequest(err: any, user: any, info: any, context: any) {
		if (err) {
			this.logger.error('Auth error', err);
			throw err;
		}

		if (!user) {
			const infoMsg = info?.message || info || 'No authentication information';
			this.logger.warn(`Authentication failed: ${infoMsg}`);
			throw new UnauthorizedException(`Unauthorized: ${infoMsg}`);
		}

		this.logger.debug(`Authentication successful for user: ${user?.userId ?? user?.sub ?? 'unknown'}`);
		return user;
	}

}