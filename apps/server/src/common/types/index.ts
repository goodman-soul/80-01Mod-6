export interface Elderly {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  roomNumber: string;
  birthday: string;
  createdAt: string;
}

export type FamilyRelation =
  | 'spouse'
  | 'child'
  | 'child_in_law'
  | 'grandchild'
  | 'sibling'
  | 'other';

export type PermissionType = 'service_records' | 'health_reminders' | 'photos';

export interface FamilyMember {
  id: string;
  elderlyId: string;
  name: string;
  phone: string;
  relation: FamilyRelation;
  relationLabel?: string;
  permissions: PermissionType[];
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VisitStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface VisitApplication {
  id: string;
  elderlyId: string;
  applicantName: string;
  applicantPhone: string;
  relation: string;
  visitDate: string;
  visitTime: string;
  reason: string;
  status: VisitStatus;
  qrCode?: string;
  qrExpiresAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageCategory = 'normal' | 'fall' | 'mood' | 'complaint';

export interface FamilyMessage {
  id: string;
  elderlyId: string;
  familyMemberId: string;
  familyMemberName: string;
  content: string;
  category: MessageCategory;
  createdAt: string;
}

export type FollowUpStatus = 'pending' | 'processing' | 'resolved';

export interface FollowUpItem {
  id: string;
  elderlyId: string;
  messageId: string;
  category: MessageCategory;
  title: string;
  description: string;
  status: FollowUpStatus;
  assignee?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AuditAction = 'permission_add' | 'permission_remove' | 'permission_update';

export interface AuditLog {
  id: string;
  elderlyId: string;
  familyMemberId: string;
  familyMemberName: string;
  operatorId: string;
  operatorName: string;
  action: AuditAction;
  oldPermissions: PermissionType[];
  newPermissions: PermissionType[];
  remark?: string;
  createdAt: string;
}

export interface Steward {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

export interface ServiceRecord {
  id: string;
  elderlyId: string;
  type: string;
  content: string;
  createdAt: string;
}

export interface HealthReminder {
  id: string;
  elderlyId: string;
  title: string;
  content: string;
  time: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  elderlyId: string;
  url: string;
  description?: string;
  createdAt: string;
}
