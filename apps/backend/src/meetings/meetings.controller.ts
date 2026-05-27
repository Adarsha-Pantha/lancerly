import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  /** Schedule a new audio meeting for a contract */
  @Post()
  schedule(
    @Req() req: any,
    @Body() body: { contractId: string; title: string; scheduledAt: string },
  ) {
    return this.meetingsService.scheduleMeeting(
      req.user.id,
      body.contractId,
      body.title,
      body.scheduledAt,
    );
  }

  /** List all meetings for a contract */
  @Get('contract/:contractId')
  forContract(@Req() req: any, @Param('contractId') contractId: string) {
    return this.meetingsService.getMeetingsForContract(req.user.id, contractId);
  }

  /** Get upcoming meetings for the authenticated user */
  @Get('upcoming')
  upcoming(@Req() req: any) {
    return this.meetingsService.getUpcomingMeetingsForUser(req.user.id);
  }

  /** Get a single meeting */
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.meetingsService.getMeeting(req.user.id, id);
  }

  /** Get a Daily.co token to join a meeting */
  @Get(':id/token')
  token(@Req() req: any, @Param('id') id: string) {
    return this.meetingsService.getMeetingToken(req.user.id, id);
  }

  /** Cancel a meeting */
  @Delete(':id')
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.meetingsService.cancelMeeting(req.user.id, id);
  }

  /** Record that the current user has left — ends meeting when both sides leave */
  @Post(':id/leave')
  leave(@Req() req: any, @Param('id') id: string) {
    return this.meetingsService.leaveMeeting(req.user.id, id);
  }
}
