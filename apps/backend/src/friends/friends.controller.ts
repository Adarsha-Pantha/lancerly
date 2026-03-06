import { Controller, Get, Post, Query, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { FriendsService } from './friends.service';
import { ConversationsService } from '../conversations/conversations.service';

@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
    private readonly conversationsService: ConversationsService,
  ) {}

  @Get('search')
  async search(@Req() req: Request, @Query('q') q = '') {
    const userId = await this.conversationsService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
    return this.friendsService.searchUsers(userId, q);
  }

  @Get()
  async list(@Req() req: Request) {
    const userId = await this.conversationsService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
    return this.friendsService.listFriends(userId);
  }

  @Post(':id')
  async add(@Req() req: Request, @Param('id') id: string) {
    const userId = await this.conversationsService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
    const friendship = await this.friendsService.addFriend(userId, id);

    // Optionally, auto-create a conversation when becoming friends
    // but only if one doesn't exist yet
    await this.conversationsService.ensureDirectConversation(userId, id);

    return friendship;
  }
}


