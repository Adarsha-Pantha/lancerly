import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto, SendMessageDto } from './dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    try {
      const userId = await this.conversationsService.userIdFromAuth(
        req.headers['authorization'] as string | undefined,
      );
      return await this.conversationsService.findAll(userId);
    } catch (error: any) {
      console.error('Error in findAll conversations:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = await this.conversationsService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
    return this.conversationsService.findOne(id, userId);
  }

  @Post()
  async create(@Body() dto: CreateConversationDto, @Req() req: Request) {
    const userId = await this.conversationsService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
    return this.conversationsService.create(userId, dto);
  }

  @Post(':id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Req() req: Request,
  ) {
    const userId = await this.conversationsService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
    return this.conversationsService.sendMessage(id, userId, dto);
  }
}

