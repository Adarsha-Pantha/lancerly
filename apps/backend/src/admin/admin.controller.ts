import { Controller, Get, Query, Param, UseGuards, Req, Post, Body, Patch } from '@nestjs/common';
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

  @Get('kyc/pending')
  @UseGuards(AdminGuard)
  async getPendingKyc() {
    return this.adminService.getPendingKyc();
  }

  @Post('kyc/:userId/approve')
  @UseGuards(AdminGuard)
  async approveKyc(@Param('userId') userId: string) {
    return this.adminService.approveKyc(userId);
  }

  @Post('kyc/:userId/reject')
  @UseGuards(AdminGuard)
  async rejectKyc(@Param('userId') userId: string, @Body('reason') reason: string) {
    return this.adminService.rejectKyc(userId, reason);
  }

  @Get('disputes')
  @UseGuards(AdminGuard)
  async getAllDisputes(@Query('status') status?: string) {
    const disputes = await this.adminService.getAllDisputes(status);
    console.log(`[DEBUG] Admin fetching disputes. Found ${disputes.length}. First one evidence count: ${(disputes[0] as any)?.evidence?.length || 0}`);
    return disputes;
  }

  @Patch('disputes/:id')
  @UseGuards(AdminGuard)
  async updateDispute(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('adminNotes') adminNotes?: string,
    @Body('resolution') resolution?: string,
  ) {
    return this.adminService.updateDispute(id, status, adminNotes, resolution);
  }
}
