import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Extracts the authenticated user from the request.
 * Use with JwtAuthGuard - req.user is set by JwtStrategy.validate().
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | string => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return data ? user[data] : user;
  },
);
