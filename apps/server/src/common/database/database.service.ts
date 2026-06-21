import { Injectable } from '@nestjs/common';
import {
  Elderly,
  FamilyMember,
  VisitApplication,
  FamilyMessage,
  FollowUpItem,
  AuditLog,
  Steward,
  ServiceRecord,
  HealthReminder,
  Photo,
  PermissionType,
  FamilyRelation,
} from '../types';

@Injectable()
export class DatabaseService {
  private elderly: Elderly[] = [
    {
      id: 'e001',
      name: '王秀兰',
      phone: '138****1234',
      roomNumber: '3号楼201室',
      birthday: '1945-03-15',
      createdAt: '2025-01-10T08:00:00Z',
    },
    {
      id: 'e002',
      name: '李建国',
      phone: '139****5678',
      roomNumber: '2号楼305室',
      birthday: '1942-08-20',
      createdAt: '2025-01-12T09:00:00Z',
    },
  ];

  private familyMembers: FamilyMember[] = [
    {
      id: 'fm001',
      elderlyId: 'e001',
      name: '张伟',
      phone: '138****1111',
      relation: 'child',
      relationLabel: '儿子',
      permissions: ['service_records', 'health_reminders', 'photos'],
      isPrimary: true,
      createdAt: '2025-01-10T08:30:00Z',
      updatedAt: '2025-01-10T08:30:00Z',
    },
    {
      id: 'fm002',
      elderlyId: 'e001',
      name: '张敏',
      phone: '139****2222',
      relation: 'child',
      relationLabel: '女儿',
      permissions: ['service_records', 'photos'],
      isPrimary: false,
      createdAt: '2025-01-11T10:00:00Z',
      updatedAt: '2025-02-15T14:30:00Z',
    },
    {
      id: 'fm003',
      elderlyId: 'e001',
      name: '王芳',
      phone: '137****3333',
      relation: 'spouse',
      relationLabel: '老伴',
      permissions: ['service_records', 'health_reminders', 'photos'],
      isPrimary: false,
      createdAt: '2025-01-10T09:00:00Z',
      updatedAt: '2025-01-10T09:00:00Z',
    },
    {
      id: 'fm004',
      elderlyId: 'e002',
      name: '李明',
      phone: '136****4444',
      relation: 'child',
      relationLabel: '儿子',
      permissions: ['service_records', 'health_reminders', 'photos'],
      isPrimary: true,
      createdAt: '2025-01-12T10:00:00Z',
      updatedAt: '2025-01-12T10:00:00Z',
    },
  ];

  private visitApplications: VisitApplication[] = [
    {
      id: 'va001',
      elderlyId: 'e001',
      applicantName: '张伟',
      applicantPhone: '138****1111',
      relation: '儿子',
      visitDate: '2025-06-22',
      visitTime: '14:00-16:00',
      reason: '周末探望母亲',
      status: 'approved',
      qrCode: 'qr_va001_abc123',
      qrExpiresAt: '2025-06-22T18:00:00Z',
      reviewedBy: 's001',
      reviewedAt: '2025-06-20T10:00:00Z',
      createdAt: '2025-06-19T09:00:00Z',
      updatedAt: '2025-06-20T10:00:00Z',
    },
    {
      id: 'va002',
      elderlyId: 'e001',
      applicantName: '刘小燕',
      applicantPhone: '135****5555',
      relation: '朋友',
      visitDate: '2025-06-23',
      visitTime: '10:00-11:30',
      reason: '老朋友探访',
      status: 'pending',
      createdAt: '2025-06-20T08:30:00Z',
      updatedAt: '2025-06-20T08:30:00Z',
    },
  ];

  private familyMessages: FamilyMessage[] = [
    {
      id: 'msg001',
      elderlyId: 'e001',
      familyMemberId: 'fm001',
      familyMemberName: '张伟',
      content: '妈妈最近吃饭怎么样？睡眠好吗？',
      category: 'normal',
      createdAt: '2025-06-18T10:00:00Z',
    },
    {
      id: 'msg002',
      elderlyId: 'e001',
      familyMemberId: 'fm002',
      familyMemberName: '张敏',
      content: '昨天妈妈说上周妈妈说有点情绪低落，麻烦多关注一下',
      category: 'mood',
      createdAt: '2025-06-19T14:30:00Z',
    },
  ];

  private followUpItems: FollowUpItem[] = [
    {
      id: 'fi001',
      elderlyId: 'e001',
      messageId: 'msg002',
      category: 'mood',
      title: '老人情绪低落需要关注',
      description: '家属张敏反映母亲最近情绪低落，需要社工跟进了解情况',
      status: 'processing',
      assignee: 's001',
      createdAt: '2025-06-19T15:00:00Z',
      updatedAt: '2025-06-19T15:00:00Z',
    },
  ];

  private auditLogs: AuditLog[] = [
    {
      id: 'al001',
      elderlyId: 'e001',
      familyMemberId: 'fm002',
      familyMemberName: '张敏',
      operatorId: 'fm001',
      operatorName: '张伟',
      action: 'permission_remove',
      oldPermissions: ['service_records', 'health_reminders', 'photos'],
      newPermissions: ['service_records', 'photos'],
      remark: '健康提醒信息过于频繁，暂不需要',
      createdAt: '2025-02-15T14:30:00Z',
    },
  ];

  private stewards: Steward[] = [
    {
      id: 's001',
      name: '刘管家',
      phone: '138****9999',
    },
  ];

  private serviceRecords: ServiceRecord[] = [
    {
      id: 'sr001',
      elderlyId: 'e001',
      type: '护理服务',
      content: '上午协助穿衣、洗漱、早餐',
      createdAt: '2025-06-20T08:00:00Z',
    },
    {
      id: 'sr002',
      elderlyId: 'e001',
      type: '康复训练',
      content: '下午户外散步30分钟',
      createdAt: '2025-06-20T15:00:00Z',
    },
    {
      id: 'sr003',
      elderlyId: 'e001',
      type: '医疗服务',
      content: '测血压 135/85mmHg',
      createdAt: '2025-06-19T09:00:00Z',
    },
  ];

  private healthReminders: HealthReminder[] = [
    {
      id: 'hr001',
      elderlyId: 'e001',
      title: '服药提醒',
      content: '降压药，每日一次',
      time: '08:00',
      createdAt: '2025-06-10T00:00:00Z',
    },
    {
      id: 'hr002',
      elderlyId: 'e001',
      title: '体检提醒',
      content: '季度体检',
      time: '09:00',
      createdAt: '2025-06-15T00:00:00Z',
    },
  ];

  private photos: Photo[] = [
    {
      id: 'p001',
      elderlyId: 'e001',
      url: 'https://images.unsplash.com/photo-1559839734-2b0b62d63217?w=400',
      description: '花园散步',
      createdAt: '2025-06-18T10:00:00Z',
    },
    {
      id: 'p002',
      elderlyId: 'e001',
      url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca62702?w=400',
      description: '生日活动',
      createdAt: '2025-03-15T14:00:00Z',
    },
  ];

  private generateId(prefix: string): string {
    return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
  }

  getElderly(id: string): Elderly | undefined {
    return this.elderly.find((e) => e.id === id);
  }

  getAllElderly(): Elderly[] {
    return [...this.elderly];
  }

  getFamilyMembersByElderly(elderlyId: string): FamilyMember[] {
    return this.familyMembers.filter((fm) => fm.elderlyId === elderlyId);
  }

  getFamilyMember(id: string): FamilyMember | undefined {
    return this.familyMembers.find((fm) => fm.id === id);
  }

  addFamilyMember(
    elderlyId: string,
    data: Omit<FamilyMember, 'id' | 'elderlyId' | 'createdAt' | 'updatedAt'>,
  ): FamilyMember {
    const now = new Date().toISOString();
    const member: FamilyMember = {
      id: this.generateId('fm'),
      elderlyId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.familyMembers.push(member);
    return member;
  }

  updateFamilyMember(
    id: string,
    data: Partial<FamilyMember>,
  ): FamilyMember | undefined {
    const index = this.familyMembers.findIndex((fm) => fm.id === id);
    if (index === -1) return undefined;
    this.familyMembers[index] = {
      ...this.familyMembers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.familyMembers[index];
  }

  deleteFamilyMember(id: string): boolean {
    const index = this.familyMembers.findIndex((fm) => fm.id === id);
    if (index === -1) return false;
    this.familyMembers.splice(index, 1);
    return true;
  }

  getVisitApplications(elderlyId?: string, status?: string): VisitApplication[] {
    return this.visitApplications.filter((va) => {
      if (elderlyId && va.elderlyId !== elderlyId) return false;
      if (status && va.status !== status) return false;
      return true;
    });
  }

  getVisitApplication(id: string): VisitApplication | undefined {
    return this.visitApplications.find((va) => va.id === id);
  }

  createVisitApplication(
    data: Omit<VisitApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ): VisitApplication {
    const now = new Date().toISOString();
    const app: VisitApplication = {
      id: this.generateId('va'),
      ...data,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    this.visitApplications.push(app);
    return app;
  }

  updateVisitApplication(
    id: string,
    data: Partial<VisitApplication>,
  ): VisitApplication | undefined {
    const index = this.visitApplications.findIndex((va) => va.id === id);
    if (index === -1) return undefined;
    this.visitApplications[index] = {
      ...this.visitApplications[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.visitApplications[index];
  }

  getFamilyMessages(elderlyId: string): FamilyMessage[] {
    return this.familyMessages.filter((m) => m.elderlyId === elderlyId);
  }

  getFamilyMessage(id: string): FamilyMessage | undefined {
    return this.familyMessages.find((m) => m.id === id);
  }

  addFamilyMessage(
    data: Omit<FamilyMessage, 'id' | 'createdAt'>,
  ): FamilyMessage {
    const msg: FamilyMessage = {
      id: this.generateId('msg'),
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.familyMessages.push(msg);
    return msg;
  }

  getFollowUpItems(elderlyId?: string, status?: string): FollowUpItem[] {
    return this.followUpItems.filter((item) => {
      if (elderlyId && item.elderlyId !== elderlyId) return false;
      if (status && item.status !== status) return false;
      return true;
    });
  }

  getFollowUpItem(id: string): FollowUpItem | undefined {
    return this.followUpItems.find((item) => item.id === id);
  }

  createFollowUpItem(
    data: Omit<FollowUpItem, 'id' | 'createdAt' | 'updatedAt'>,
  ): FollowUpItem {
    const now = new Date().toISOString();
    const item: FollowUpItem = {
      id: this.generateId('fi'),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.followUpItems.push(item);
    return item;
  }

  updateFollowUpItem(
    id: string,
    data: Partial<FollowUpItem>,
  ): FollowUpItem | undefined {
    const index = this.followUpItems.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    this.followUpItems[index] = {
      ...this.followUpItems[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.followUpItems[index];
  }

  getAuditLogs(elderlyId: string): AuditLog[] {
    return this.auditLogs.filter((log) => log.elderlyId === elderlyId);
  }

  addAuditLog(data: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const log: AuditLog = {
      id: this.generateId('al'),
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.push(log);
    return log;
  }

  getSteward(id: string): Steward | undefined {
    return this.stewards.find((s) => s.id === id);
  }

  getAllStewards(): Steward[] {
    return [...this.stewards];
  }

  getServiceRecords(elderlyId: string): ServiceRecord[] {
    return this.serviceRecords.filter((r) => r.elderlyId === elderlyId);
  }

  getHealthReminders(elderlyId: string): HealthReminder[] {
    return this.healthReminders.filter((r) => r.elderlyId === elderlyId);
  }

  getPhotos(elderlyId: string): Photo[] {
    return this.photos.filter((p) => p.elderlyId === elderlyId);
  }
}
