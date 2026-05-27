import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: Request) {
    try {
      const userId = (req.user as { sub: string })?.sub;
      if (!userId) {
        return { message: 'User not found', statusCode: 401 };
      }
      return await this.notificationsService.getUserNotifications(userId);
    } catch (error: unknown) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    try {
      const userId = (req.user as { sub: string })?.sub;
      if (!userId) {
        return { message: 'User not found', statusCode: 401 };
      }
      return await this.notificationsService.markAsRead(userId, id);
    } catch (error: unknown) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Req() req: Request) {
    try {
      const userId = (req.user as { sub: string })?.sub;
      if (!userId) {
        return { message: 'User not found', statusCode: 401 };
      }
      return await this.notificationsService.markAllAsRead(userId);
    } catch (error: unknown) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}
