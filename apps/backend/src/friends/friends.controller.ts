import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { FriendsService } from './friends.service';
import { ConversationsService } from '../conversations/conversations.service';

@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
    private readonly conversationsService: ConversationsService,
  ) {}

  private uid(req: Request) {
    return this.conversationsService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
  }

  /** GET /friends/search?q= */
  @Get('search')
  async search(@Req() req: Request, @Query('q') q = '') {
    const userId = await this.uid(req);
    return this.friendsService.searchUsers(userId, q);
  }

  /** GET /friends/requests/incoming */
  @Get('requests/incoming')
  async incoming(@Req() req: Request) {
    const userId = await this.uid(req);
    return this.friendsService.listIncomingRequests(userId);
  }

  /** GET /friends/requests/sent */
  @Get('requests/sent')
  async sent(@Req() req: Request) {
    const userId = await this.uid(req);
    return this.friendsService.listSentRequests(userId);
  }

  /** GET /friends */
  @Get()
  async list(@Req() req: Request) {
    const userId = await this.uid(req);
    return this.friendsService.listFriends(userId);
  }

  /** POST /friends/request/:id — send friend request */
  @Post('request/:id')
  async sendRequest(@Req() req: Request, @Param('id') id: string) {
    const userId = await this.uid(req);
    return this.friendsService.sendRequest(userId, id);
  }

  /** POST /friends/accept/:requestId — accept incoming request */
  @Post('accept/:requestId')
  async accept(@Req() req: Request, @Param('requestId') requestId: string) {
    const userId = await this.uid(req);
    return this.friendsService.acceptRequest(userId, requestId, this.conversationsService);
  }

  /** POST /friends/decline/:requestId — decline incoming request */
  @Post('decline/:requestId')
  async decline(@Req() req: Request, @Param('requestId') requestId: string) {
    const userId = await this.uid(req);
    return this.friendsService.declineRequest(userId, requestId);
  }

  /** DELETE /friends/cancel/:requestId — cancel a sent request */
  @Delete('cancel/:requestId')
  async cancel(@Req() req: Request, @Param('requestId') requestId: string) {
    const userId = await this.uid(req);
    return this.friendsService.cancelRequest(userId, requestId);
  }

  /** DELETE /friends/:targetId — remove an accepted friend */
  @Delete(':targetId')
  async remove(@Req() req: Request, @Param('targetId') targetId: string) {
    const userId = await this.uid(req);
    return this.friendsService.removeFriend(userId, targetId);
  }
}


