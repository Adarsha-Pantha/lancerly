import { Controller, Get, Query, Param, UseGuards, Req, Post, Body } from '@nestjs/common';
import type { Request } from 'express';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('check-admin-exists')
  async checkAdminExists() {
    return this.adminService.checkAdminExists();
  }

  @Get('dashboard/stats')
  @UseGuards(AdminGuard)
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @UseGuards(AdminGuard)
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('projects')
  @UseGuards(AdminGuard)
  async getAllProjects(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllProjects(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('posts')
  @UseGuards(AdminGuard)
  async getAllPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllPosts(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('conversations')
  @UseGuards(AdminGuard)
  async getAllConversations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllConversations(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('users/:id/activity')
  @UseGuards(AdminGuard)
  async getUserActivity(@Param('id') userId: string) {
    return this.adminService.getUserActivity(userId);
  }

  @Get('settings/platform')
  @UseGuards(AdminGuard)
  async getPlatformSettings() {
    return this.adminService.getPlatformSettings();
  }

  @Post('settings/platform')
  @UseGuards(AdminGuard)
  async updatePlatformSettings(@Body() data: { freelancerServiceFee?: number; clientProcessingFee?: number }) {
    return this.adminService.updatePlatformSettings(data);
  }

  @Get('finance/stats')
  @UseGuards(AdminGuard)
  async getFinanceStats() {
    return this.adminService.getFinanceStats();
  }
}
