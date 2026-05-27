// apps/backend/src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { AdminRegisterDto, AdminLoginDto } from '../admin/dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Email/password register */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  /** Email/password login */
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, req);
  }

  /** Google OAuth start (Passport will redirect to Google) */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    return;
  }

  /** Google OAuth callback */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // req.user is set by GoogleStrategy.validate()
    const { token } = await this.auth.issueJwtAndRecordLogin(req.user as any, req);

    const origin = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').replace(/\/+$/, '');
    // Send the JWT back to the frontend where /oauth will store it and route accordingly
    return res.redirect(`${origin}/oauth?token=${encodeURIComponent(token)}`);
  }

  /** Current user (verify token and return flattened user + profile) */
  @Get('me')
  async me(@Req() req: Request) {
    const authHeader = req.headers['authorization'] as string | undefined;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = authHeader.slice(7);
    return this.auth.me(token);
  }

  /** Set role to CLIENT or FREELANCER (after OAuth role selection) */
  @Put('role')
  @UseGuards(JwtAuthGuard)
  async setRole(
    @CurrentUser('userId') userId: string,
    @Body() body: { role: 'CLIENT' | 'FREELANCER' },
  ) {
    if (!userId) throw new UnauthorizedException('Not authenticated');
    if (!body?.role || (body.role !== 'CLIENT' && body.role !== 'FREELANCER')) {
      throw new UnauthorizedException('Role must be CLIENT or FREELANCER');
    }
    return this.auth.setRole(userId, body.role);
  }

  /** Admin register */
  @Post('admin/register')
  adminRegister(@Body() dto: AdminRegisterDto, @Req() req: Request) {
    return this.auth.adminRegister(dto, req);
  }

  /** Admin login */
  @Post('admin/login')
  adminLogin(@Body() dto: AdminLoginDto, @Req() req: Request) {
    return this.auth.adminLogin(dto, req);
  }
}
