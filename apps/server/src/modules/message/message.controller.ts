import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import type {
  FamilyMessage,
  FollowUpItem,
  FollowUpStatus,
} from '../../common/types';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('elderly/:elderlyId')
  getMessages(@Param('elderlyId') elderlyId: string): FamilyMessage[] {
    return this.messageService.getMessages(elderlyId);
  }

  @Get(':id')
  getMessage(@Param('id') id: string): FamilyMessage {
    return this.messageService.getMessage(id);
  }

  @Post('elderly/:elderlyId')
  addMessage(
    @Param('elderlyId') elderlyId: string,
    @Body()
    body: {
      familyMemberId: string;
      familyMemberName: string;
      content: string;
    },
  ): { message: FamilyMessage; followUpItem?: FollowUpItem } {
    return this.messageService.addMessage(
      elderlyId,
      body.familyMemberId,
      body.familyMemberName,
      body.content,
    );
  }

  @Get('follow-up/list')
  getFollowUpItems(
    @Query('elderlyId') elderlyId?: string,
    @Query('status') status?: FollowUpStatus,
  ): FollowUpItem[] {
    return this.messageService.getFollowUpItems(elderlyId, status);
  }

  @Get('follow-up/:id')
  getFollowUpItem(@Param('id') id: string): FollowUpItem {
    return this.messageService.getFollowUpItem(id);
  }

  @Put('follow-up/:id/status')
  updateFollowUpStatus(
    @Param('id') id: string,
    @Body() body: { status: FollowUpStatus; assignee?: string },
  ): FollowUpItem {
    return this.messageService.updateFollowUpStatus(
      id,
      body.status,
      body.assignee,
    );
  }
}
