// apps/backend/src/settings/settings.controller.ts
import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SettingsService } from './settings.service';
import { UpdatePasswordDto, UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@Req() req: Request) {
    return this.settingsService.getSettings(
      req.headers['authorization'] as string | undefined,
    );
  }

  @Put('password')
  updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    return this.settingsService.updatePassword(
      req.headers['authorization'] as string | undefined,
      dto,
    );
  }

  @Put()
  updateSettings(@Req() req: Request, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(
      req.headers['authorization'] as string | undefined,
      dto,
    );
  }
}

