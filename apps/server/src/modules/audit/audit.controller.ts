import { Controller, Get, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import type { AuditLog } from '../../common/types';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('elderly/:elderlyId')
  getAuditLogs(@Param('elderlyId') elderlyId: string): AuditLog[] {
    return this.auditService.getAuditLogs(elderlyId);
  }
}
