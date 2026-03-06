import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Global() // makes PrismaService available app-wide without re-imports
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
