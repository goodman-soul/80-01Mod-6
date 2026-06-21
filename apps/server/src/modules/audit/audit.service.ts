import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { AuditLog } from '../../common/types';

@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) {}

  getAuditLogs(elderlyId: string): AuditLog[] {
    return this.db.getAuditLogs(elderlyId);
  }

  addAuditLog(data: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    return this.db.addAuditLog(data);
  }
}
