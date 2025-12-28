import { Controller, Get, Post, Param, UseGuards, Req, HttpCode } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getUserNotifications(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.getUserNotifications(req.user.userId);
  }

  @Post('read-all')
  @HttpCode(204)
  markAllAsRead(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Post(':id/read')
  @HttpCode(204)
  markAsRead(
    @Req() req: AuthenticatedRequest,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(req.user.userId, notificationId);
  }
}
