import type {
  Elderly,
  FamilyMember,
  VisitApplication,
  FamilyMessage,
  FollowUpItem,
  AuditLog,
  PermissionType,
  FollowUpStatus,
  FamilyRelation,
  ServiceRecord,
  HealthReminder,
  Photo,
} from './types';

const BASE_URL = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message || '请求失败',
    );
  }

  return response.json();
}

export const api = {
  getElderlyList: (): Promise<Elderly[]> => request<Elderly[]>('/elderly'),

  getElderly: (id: string): Promise<Elderly> => request<Elderly>(`/elderly/${id}`),

  getFamilyMembers: (elderlyId: string): Promise<FamilyMember[]> =>
    request<FamilyMember[]>(`/family/elderly/${elderlyId}`),

  getFamilyMember: (id: string): Promise<FamilyMember> =>
    request<FamilyMember>(`/family/${id}`),

  addFamilyMember: (
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
  ): Promise<FamilyMember> =>
    request<FamilyMember>(`/family/elderly/${elderlyId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePermissions: (
    id: string,
    data: {
      permissions: PermissionType[];
      operatorId: string;
      operatorName: string;
      remark?: string;
    },
  ): Promise<FamilyMember> =>
    request<FamilyMember>(`/family/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  removeFamilyMember: (
    id: string,
    operatorId: string,
    operatorName: string,
  ): Promise<{ success: boolean }> =>
    request<{ success: boolean }>(`/family/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ operatorId, operatorName }),
    }),

  getAuthorizedContent: (
    familyMemberId: string,
    type: PermissionType,
  ): Promise<ServiceRecord[] | HealthReminder[] | Photo[]> =>
    request<ServiceRecord[] | HealthReminder[] | Photo[]>(
      `/family/content/${familyMemberId}/${type}`,
    ),

  getVisitApplications: (
    elderlyId?: string,
    status?: string,
  ): Promise<VisitApplication[]> => {
    const params = new URLSearchParams();
    if (elderlyId) params.set('elderlyId', elderlyId);
    if (status) params.set('status', status);
    return request<VisitApplication[]>(`/visit?${params.toString()}`);
  },

  getVisitApplication: (id: string): Promise<VisitApplication> =>
    request<VisitApplication>(`/visit/${id}`),

  createVisitApplication: (data: {
    elderlyId: string;
    applicantName: string;
    applicantPhone: string;
    relation: string;
    visitDate: string;
    visitTime: string;
    reason: string;
  }): Promise<VisitApplication> =>
    request<VisitApplication>('/visit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approveVisit: (
    id: string,
    stewardId: string,
    stewardName: string,
  ): Promise<VisitApplication> =>
    request<VisitApplication>(`/visit/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ stewardId, stewardName }),
    }),

  rejectVisit: (
    id: string,
    stewardId: string,
    stewardName: string,
    rejectReason: string,
  ): Promise<VisitApplication> =>
    request<VisitApplication>(`/visit/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ stewardId, stewardName, rejectReason }),
    }),

  getQRCode: (id: string): Promise<{ qrCode: string; expiresAt: string }> =>
    request<{ qrCode: string; expiresAt: string }>(`/visit/${id}/qrcode`),

  getMessages: (elderlyId: string): Promise<FamilyMessage[]> =>
    request<FamilyMessage[]>(`/messages/elderly/${elderlyId}`),

  addMessage: (
    elderlyId: string,
    data: {
      familyMemberId: string;
      familyMemberName: string;
      content: string;
    },
  ): Promise<{ message: FamilyMessage; followUpItem?: FollowUpItem }> =>
    request<{ message: FamilyMessage; followUpItem?: FollowUpItem }>(
      `/messages/elderly/${elderlyId}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    ),

  getFollowUpItems: (
    elderlyId?: string,
    status?: FollowUpStatus,
  ): Promise<FollowUpItem[]> => {
    const params = new URLSearchParams();
    if (elderlyId) params.set('elderlyId', elderlyId);
    if (status) params.set('status', status);
    return request<FollowUpItem[]>(`/messages/follow-up/list?${params.toString()}`);
  },

  getFollowUpItem: (id: string): Promise<FollowUpItem> =>
    request<FollowUpItem>(`/messages/follow-up/${id}`),

  updateFollowUpStatus: (
    id: string,
    status: FollowUpStatus,
    assignee?: string,
  ): Promise<FollowUpItem> =>
    request<FollowUpItem>(`/messages/follow-up/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, assignee }),
    }),

  getAuditLogs: (elderlyId: string): Promise<AuditLog[]> =>
    request<AuditLog[]>(`/audit/elderly/${elderlyId}`),
};
