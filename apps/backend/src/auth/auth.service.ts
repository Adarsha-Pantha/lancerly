// apps/backend/src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';
import { Role } from '@prisma/client';
import { RegisterDto, LoginDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /* ------------------------ helpers ------------------------ */

  private getClientIp(req?: Request | any): string | null {
    const xfwd = (req?.headers?.['x-forwarded-for'] as string) || '';
    const forwarded = xfwd.split(',')[0]?.trim();
    const raw =
      forwarded || req?.ip || (req as any)?.socket?.remoteAddress || null;
    return typeof raw === 'string' ? raw.replace('::ffff:', '') : raw;
  }

  private flattenUser(u: {
    id: string;
    email: string;
    role: Role;
    isSubscribed: boolean;
    createdAt: Date;
    profile?: {
      name: string | null;
      avatarUrl: string | null;
      dob: Date | null;
      country: string | null;
      phone: string | null;
      street: string | null;
      city: string | null;
      state: string | null;
      postalCode: string | null;
      isComplete: boolean | null;
    } | null;
  }) {
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      isSubscribed: u.isSubscribed ?? false,
      name: u.profile?.name ?? null,
      avatarUrl: u.profile?.avatarUrl ?? null,
      dob: u.profile?.dob ?? null,
      country: u.profile?.country ?? null,
      phone: u.profile?.phone ?? null,
      street: u.profile?.street ?? null,
      city: u.profile?.city ?? null,
      state: u.profile?.state ?? null,
      postalCode: u.profile?.postalCode ?? null,
      isComplete: u.profile?.isComplete ?? false,
    };
  }

  /* ------------------------ email/password ------------------------ */

  async register(dto: RegisterDto) {
    if (!dto?.email || !dto?.password || !dto?.name) {
      throw new BadRequestException('Name, email and password are required');
    }

    const email = dto.email.trim().toLowerCase();
    const exists = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (exists) throw new BadRequestException('Email already registered');

    const userCount = await this.prisma.user.count();
    const isFirstUser = userCount === 0;

    const hash = await bcrypt.hash(dto.password, 10);
    const role: Role = isFirstUser ? 'ADMIN' : (dto.role === 'CLIENT' ? 'CLIENT' : 'FREELANCER');

    const created = await this.prisma.user.create({
      data: {
        email,
        password: hash,
        role,
        profile: {
          create: {
            name: dto.name,
            availability: true,
            // the rest of profile fields start empty; isComplete stays false
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        isSubscribed: true,
        createdAt: true,
        profile: {
          select: {
            name: true,
            avatarUrl: true,
            dob: true,
            country: true,
            phone: true,
            street: true,
            city: true,
            state: true,
            postalCode: true,
            isComplete: true,
          },
        },
      },
    });

    const token = await this.jwt.signAsync({
      sub: created.id,
      email: created.email,
      role: created.role,
    });

    return { user: this.flattenUser(created), token };
  }

  async login(dto: LoginDto, req?: Request) {
    if (!dto?.email || !dto?.password) {
      throw new BadRequestException('Email and password are required');
    }
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // record login (best-effort)
    try {
      await this.prisma.login.create({
        data: {
          userId: user.id,
          ip: this.getClientIp(req),
          userAgent: (req?.headers?.['user-agent'] as string) || null,
        },
      });
    } catch {
      /* noop */
    }

    const withProfile = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isSubscribed: true,
        createdAt: true,
        profile: {
          select: {
            name: true,
            avatarUrl: true,
            dob: true,
            country: true,
            phone: true,
            street: true,
            city: true,
            state: true,
            postalCode: true,
            isComplete: true,
          },
        },
      },
    });

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: this.flattenUser(withProfile!), token };
  }

  /* ------------------------ OAuth helpers ------------------------ */

  // Create or find a user for Google OAuth
  async upsertOAuthUser(params: {
    provider: 'GOOGLE';
    providerId: string;
    email?: string;
    name: string;
    avatarUrl?: string;
  }) {
    const { providerId, email, name, avatarUrl } = params;

    if (email) {
      const normalized = email.trim().toLowerCase();

      let user = await this.prisma.user.findUnique({
        where: { email: normalized },
        include: { profile: true },
      });

      if (!user) {
        const userCount = await this.prisma.user.count();
        const isFirstUser = userCount === 0;

        user = await this.prisma.user.create({
          data: {
            email: normalized,
            role: isFirstUser ? 'ADMIN' : 'PENDING',
            password: await bcrypt.hash(providerId, 10),
            profile: {
              create: {
                name,
                availability: true,
                avatarUrl: avatarUrl || null,
              },
            },
          },
          include: { profile: true },
        });
      } else if (!user.profile?.avatarUrl && avatarUrl) {
        await this.prisma.profile.update({
          where: { userId: user.id },
          data: { avatarUrl },
        });
        user = (await this.prisma.user.findUnique({
          where: { id: user.id },
          include: { profile: true },
        }))!;
      }

      return this.flattenUser({
        id: user.id,
        email: user.email,
        role: user.role,
        isSubscribed: user.isSubscribed,
        createdAt: user.createdAt,
        profile: {
          name: user.profile?.name ?? null,
          avatarUrl: user.profile?.avatarUrl ?? null,
          dob: user.profile?.dob ?? null,
          country: user.profile?.country ?? null,
          phone: user.profile?.phone ?? null,
          street: user.profile?.street ?? null,
          city: user.profile?.city ?? null,
          state: user.profile?.state ?? null,
          postalCode: user.profile?.postalCode ?? null,
          isComplete: (user.profile as any)?.isComplete ?? false,
        },
      });
    }

    // Fallback (rare: Google scope without email)
    const fallbackUserCount = await this.prisma.user.count();
    const isFirstFallbackUser = fallbackUserCount === 0;

    const fallbackEmail = `google_${providerId}@example.local`;
    const user = await this.prisma.user.upsert({
      where: { email: fallbackEmail },
      create: {
        email: fallbackEmail,
        role: isFirstFallbackUser ? 'ADMIN' : 'PENDING',
        password: await bcrypt.hash(providerId, 10),
        profile: {
          create: {
            name,
            availability: true,
            avatarUrl: avatarUrl || null,
          },
        },
      },
      update: {},
      include: { profile: true },
    });

    return this.flattenUser({
      id: user.id,
      email: user.email,
      role: user.role,
      isSubscribed: user.isSubscribed,
      createdAt: user.createdAt,
      profile: {
        name: user.profile?.name ?? null,
        avatarUrl: user.profile?.avatarUrl ?? null,
        dob: user.profile?.dob ?? null,
        country: user.profile?.country ?? null,
        phone: user.profile?.phone ?? null,
        street: user.profile?.street ?? null,
        city: user.profile?.city ?? null,
        state: user.profile?.state ?? null,
        postalCode: user.profile?.postalCode ?? null,
        isComplete: (user.profile as any)?.isComplete ?? false,
      },
    });
  }

  // After OAuth strategy sets req.user, issue a JWT and record login
  async issueJwtAndRecordLogin(
    user: { id: string; email: string; role: Role },
    req?: Request,
  ) {
    try {
      await this.prisma.login.create({
        data: {
          userId: user.id,
          ip: this.getClientIp(req),
          userAgent: (req?.headers?.['user-agent'] as string) || null,
        },
      });
    } catch {
      /* noop */
    }

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { token };
  }

  /* ------------------------ session ------------------------ */

  // Verify token and return flattened user (used by GET /auth/me)
  async me(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);

      const u = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          isSubscribed: true,
          createdAt: true,
          profile: {
            select: {
              name: true,
              avatarUrl: true,
              dob: true,
              country: true,
              phone: true,
              street: true,
              city: true,
              state: true,
              postalCode: true,
              isComplete: true,
            },
          },
        },
      });

      if (!u) throw new UnauthorizedException('User not found');

      return { user: this.flattenUser(u) };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /** Set role (CLIENT or FREELANCER) - used after OAuth when user has PENDING */
  async setRole(userId: string, role: 'CLIENT' | 'FREELANCER') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.role === 'ADMIN') throw new BadRequestException('Cannot change admin role');
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        isSubscribed: true,
        createdAt: true,
        profile: {
          select: {
            name: true,
            avatarUrl: true,
            dob: true,
            country: true,
            phone: true,
            street: true,
            city: true,
            state: true,
            postalCode: true,
            isComplete: true,
          },
        },
      },
    });
    return { user: this.flattenUser(updated) };
  }

  /* ------------------------ Admin ------------------------ */

  async adminRegister(dto: { name: string; email: string; password: string }, req?: Request) {
    if (!dto?.email || !dto?.password || !dto?.name) {
      throw new BadRequestException('Name, email and password are required');
    }

    // Check if an admin already exists - only one admin allowed
    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    if (existingAdmin) {
      throw new BadRequestException('Admin account already exists. Only one admin is allowed.');
    }

    const email = dto.email.trim().toLowerCase();
    const exists = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (exists) throw new BadRequestException('Email already registered');

    const hash = await bcrypt.hash(dto.password, 10);

    const created = await this.prisma.user.create({
      data: {
        email,
        password: hash,
        role: 'ADMIN',
        profile: {
          create: {
            name: dto.name,
            availability: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        isSubscribed: true,
        createdAt: true,
        profile: {
          select: {
            name: true,
            avatarUrl: true,
            dob: true,
            country: true,
            phone: true,
            street: true,
            city: true,
            state: true,
            postalCode: true,
            isComplete: true,
          },
        },
      },
    });

    // Record login
    try {
      await this.prisma.login.create({
        data: {
          userId: created.id,
          ip: this.getClientIp(req),
          userAgent: (req?.headers?.['user-agent'] as string) || null,
        },
      });
    } catch {
      /* noop */
    }

    const token = await this.jwt.signAsync({
      sub: created.id,
      email: created.email,
      role: created.role,
    });

    return { user: this.flattenUser(created), token };
  }

  async adminLogin(dto: { email: string; password: string }, req?: Request) {
    if (!dto?.email || !dto?.password) {
      throw new BadRequestException('Email and password are required');
    }
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.role !== 'ADMIN') throw new UnauthorizedException('Admin access required');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Record login
    try {
      await this.prisma.login.create({
        data: {
          userId: user.id,
          ip: this.getClientIp(req),
          userAgent: (req?.headers?.['user-agent'] as string) || null,
        },
      });
    } catch {
      /* noop */
    }

    const withProfile = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isSubscribed: true,
        createdAt: true,
        profile: {
          select: {
            name: true,
            avatarUrl: true,
            dob: true,
            country: true,
            phone: true,
            street: true,
            city: true,
            state: true,
            postalCode: true,
            isComplete: true,
          },
        },
      },
    });

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: this.flattenUser(withProfile!), token };
  }
}
