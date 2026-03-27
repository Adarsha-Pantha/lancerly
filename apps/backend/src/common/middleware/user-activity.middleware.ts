import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserActivityMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        // Use decode instead of verifyAsync for presence tracking to avoid secret configuration issues
        // and because this is just for presence, not security (guards handle security)
        const payload = this.jwt.decode(token) as { sub: string } | null;
        
        if (payload?.sub) {
          await this.prisma.user.update({
            where: { id: payload.sub },
            data: { lastActiveAt: new Date() },
          }).then(() => {
            // console.log(`Updated presence for user: ${payload.sub}`);
          }).catch(err => {
            console.error(`Error updating lastActiveAt for user ${payload.sub}:`, err.message);
          });
        }
      } catch (e: any) {
        console.error('Middleware error decoding token:', e.message);
      }
    }
    next();
  }
}
