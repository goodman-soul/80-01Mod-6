import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import {
  FamilyMessage,
  MessageCategory,
  FollowUpItem,
  FollowUpStatus,
} from '../../common/types';

@Injectable()
export class MessageService {
  constructor(private readonly db: DatabaseService) {}

  private fallKeywords = ['跌倒', '摔倒', '摔了', '磕碰', '受伤', '摔跤'];
  private moodKeywords = [
    '情绪低落',
    '心情不好',
    '闷闷不乐',
    '情绪不好',
    '不开心',
    '抑郁',
    '焦虑',
  ];
  private complaintKeywords = ['投诉', '不满', '不满意', '太差了', '不好', '问题'];

  detectCategory(content: string): MessageCategory {
    const text = content.toLowerCase();

    for (const keyword of this.fallKeywords) {
      if (text.includes(keyword)) {
        return 'fall';
      }
    }

    for (const keyword of this.moodKeywords) {
      if (text.includes(keyword)) {
        return 'mood';
      }
    }

    for (const keyword of this.complaintKeywords) {
      if (text.includes(keyword)) {
        return 'complaint';
      }
    }

    return 'normal';
  }

  private generateFollowUpTitle(
    category: MessageCategory,
    content: string,
  ): string {
    switch (category) {
      case 'fall':
        return '老人跌倒风险关注';
      case 'mood':
        return '老人情绪状态关注';
      case 'complaint':
        return '家属投诉处理';
      default:
        return content.slice(0, 20);
    }
  }

  getMessages(elderlyId: string): FamilyMessage[] {
    return this.db.getFamilyMessages(elderlyId);
  }

  getMessage(id: string): FamilyMessage {
    const msg = this.db.getFamilyMessage(id);
    if (!msg) {
      throw new NotFoundException('留言不存在');
    }
    return msg;
  }

  addMessage(
    elderlyId: string,
    familyMemberId: string,
    familyMemberName: string,
    content: string,
  ): { message: FamilyMessage; followUpItem?: FollowUpItem } {
    const category = this.detectCategory(content);

    const message = this.db.addFamilyMessage({
      elderlyId,
      familyMemberId,
      familyMemberName,
      content,
      category,
    });

    let followUpItem: FollowUpItem | undefined;
    if (category !== 'normal') {
      followUpItem = this.db.createFollowUpItem({
        elderlyId,
        messageId: message.id,
        category,
        title: this.generateFollowUpTitle(category, content),
        description: `家属 ${familyMemberName} 留言: ${content}`,
        status: 'pending',
      });
    }

    return { message, followUpItem };
  }

  getFollowUpItems(
    elderlyId?: string,
    status?: FollowUpStatus,
  ): FollowUpItem[] {
    return this.db.getFollowUpItems(elderlyId, status);
  }

  getFollowUpItem(id: string): FollowUpItem {
    const item = this.db.getFollowUpItem(id);
    if (!item) {
      throw new NotFoundException('跟进事项不存在');
    }
    return item;
  }

  updateFollowUpStatus(
    id: string,
    status: FollowUpStatus,
    assignee?: string,
  ): FollowUpItem {
    const item = this.db.getFollowUpItem(id);
    if (!item) {
      throw new NotFoundException('跟进事项不存在');
    }

    const data: Partial<FollowUpItem> = { status };
    if (assignee) {
      data.assignee = assignee;
    }
    if (status === 'resolved') {
      data.resolvedAt = new Date().toISOString();
    }

    const updated = this.db.updateFollowUpItem(id, data);
    return updated!;
  }
}
