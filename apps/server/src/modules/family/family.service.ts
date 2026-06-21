import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import {
  FamilyMember,
  PermissionType,
  FamilyRelation,
  AuditLog,
} from '../../common/types';

@Injectable()
export class FamilyService {
  constructor(private readonly db: DatabaseService) {}

  getFamilyMembers(elderlyId: string): FamilyMember[] {
    return this.db.getFamilyMembersByElderly(elderlyId);
  }

  getFamilyMember(id: string): FamilyMember {
    const member = this.db.getFamilyMember(id);
    if (!member) {
      throw new NotFoundException('家属成员不存在');
    }
    return member;
  }

  addFamilyMember(
    elderlyId: string,
    data: {
      name: string;
      phone: string;
      relation: FamilyRelation;
      relationLabel?: string;
      permissions: PermissionType[];
      isPrimary?: boolean;
      operatorId: string;
      operatorName: string;
    },
  ): FamilyMember {
    const elderly = this.db.getElderly(elderlyId);
    if (!elderly) {
      throw new NotFoundException('老人信息不存在');
    }

    if (data.isPrimary) {
      const existingPrimary = this.db
        .getFamilyMembersByElderly(elderlyId)
        .find((m) => m.isPrimary);
      if (existingPrimary) {
        throw new BadRequestException('已存在主要家属');
      }
    }

    const member = this.db.addFamilyMember(elderlyId, {
      name: data.name,
      phone: data.phone,
      relation: data.relation,
      relationLabel: data.relationLabel,
      permissions: data.permissions,
      isPrimary: data.isPrimary ?? false,
    });

    this.db.addAuditLog({
      elderlyId,
      familyMemberId: member.id,
      familyMemberName: member.name,
      operatorId: data.operatorId,
      operatorName: data.operatorName,
      action: 'permission_add',
      oldPermissions: [],
      newPermissions: data.permissions,
      remark: '添加家属成员',
    });

    return member;
  }

  updatePermissions(
    id: string,
    permissions: PermissionType[],
    operatorId: string,
    operatorName: string,
    remark?: string,
  ): FamilyMember {
    const member = this.db.getFamilyMember(id);
    if (!member) {
      throw new NotFoundException('家属成员不存在');
    }

    const oldPermissions = [...member.permissions];

    const updated = this.db.updateFamilyMember(id, { permissions });
    if (!updated) {
      throw new NotFoundException('家属成员不存在');
    }

    this.db.addAuditLog({
      elderlyId: member.elderlyId,
      familyMemberId: member.id,
      familyMemberName: member.name,
      operatorId,
      operatorName,
      action: 'permission_update',
      oldPermissions,
      newPermissions: permissions,
      remark,
    });

    return updated;
  }

  removeFamilyMember(
    id: string,
    operatorId: string,
    operatorName: string,
  ): boolean {
    const member = this.db.getFamilyMember(id);
    if (!member) {
      throw new NotFoundException('家属成员不存在');
    }

    if (member.isPrimary) {
      throw new BadRequestException('主要家属不能删除');
    }

    const oldPermissions = [...member.permissions];

    const success = this.db.deleteFamilyMember(id);
    if (success) {
      this.db.addAuditLog({
        elderlyId: member.elderlyId,
        familyMemberId: member.id,
        familyMemberName: member.name,
        operatorId,
        operatorName,
        action: 'permission_remove',
        oldPermissions,
        newPermissions: [],
        remark: '删除家属成员',
      });
    }

    return success;
  }

  getAuthorizedContent(
    familyMemberId: string,
    type: PermissionType,
  ): unknown {
    const member = this.db.getFamilyMember(familyMemberId);
    if (!member) {
      throw new NotFoundException('家属成员不存在');
    }

    if (!member.permissions.includes(type)) {
      throw new BadRequestException('没有权限访问该内容');
    }

    switch (type) {
      case 'service_records':
        return this.db.getServiceRecords(member.elderlyId);
      case 'health_reminders':
        return this.db.getHealthReminders(member.elderlyId);
      case 'photos':
        return this.db.getPhotos(member.elderlyId);
      default:
        throw new BadRequestException('无效的权限类型');
    }
  }
}
