import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { VisitApplication, VisitStatus } from '../../common/types';

@Injectable()
export class VisitService {
  constructor(private readonly db: DatabaseService) {}

  getApplications(elderlyId?: string, status?: string): VisitApplication[] {
    return this.db.getVisitApplications(elderlyId, status);
  }

  getApplication(id: string): VisitApplication {
    const app = this.db.getVisitApplication(id);
    if (!app) {
      throw new NotFoundException('探访申请不存在');
    }
    return app;
  }

  createApplication(
    data: {
      elderlyId: string;
      applicantName: string;
      applicantPhone: string;
      relation: string;
      visitDate: string;
      visitTime: string;
      reason: string;
    },
  ): VisitApplication {
    const elderly = this.db.getElderly(data.elderlyId);
    if (!elderly) {
      throw new NotFoundException('老人信息不存在');
    }

    return this.db.createVisitApplication({
      elderlyId: data.elderlyId,
      applicantName: data.applicantName,
      applicantPhone: data.applicantPhone,
      relation: data.relation,
      visitDate: data.visitDate,
      visitTime: data.visitTime,
      reason: data.reason,
    });
  }

  approveApplication(
    id: string,
    stewardId: string,
    stewardName: string,
  ): VisitApplication {
    const app = this.db.getVisitApplication(id);
    if (!app) {
      throw new NotFoundException('探访申请不存在');
    }

    if (app.status !== 'pending') {
      throw new BadRequestException('申请状态不正确，无法审核');
    }

    const qrCode = this.generateQRCode(id);
    const qrExpiresAt = new Date(
      new Date(app.visitDate).getTime() + 24 * 60 * 60 * 1000,
    ).toISOString();

    const updated = this.db.updateVisitApplication(id, {
      status: 'approved',
      qrCode,
      qrExpiresAt,
      reviewedBy: stewardId,
      reviewedAt: new Date().toISOString(),
    });

    return updated!;
  }

  rejectApplication(
    id: string,
    stewardId: string,
    stewardName: string,
    rejectReason: string,
  ): VisitApplication {
    const app = this.db.getVisitApplication(id);
    if (!app) {
      throw new NotFoundException('探访申请不存在');
    }

    if (app.status !== 'pending') {
      throw new BadRequestException('申请状态不正确，无法审核');
    }

    const updated = this.db.updateVisitApplication(id, {
      status: 'rejected',
      reviewedBy: stewardId,
      reviewedAt: new Date().toISOString(),
      rejectReason,
    });

    return updated!;
  }

  getQRCode(id: string): { qrCode: string; expiresAt: string } {
    const app = this.db.getVisitApplication(id);
    if (!app) {
      throw new NotFoundException('探访申请不存在');
    }

    if (app.status !== 'approved') {
      throw new BadRequestException('申请未通过审核，无法获取二维码');
    }

    if (!app.qrCode || !app.qrExpiresAt) {
      throw new BadRequestException('二维码未生成');
    }

    if (new Date(app.qrExpiresAt) < new Date()) {
      throw new BadRequestException('二维码已过期');
    }

    return {
      qrCode: app.qrCode,
      expiresAt: app.qrExpiresAt,
    };
  }

  private generateQRCode(applicationId: string): string {
    return `visit_qr_${applicationId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  verifyQRCode(qrCode: string): VisitApplication {
    const apps = this.db.getVisitApplications();
    const app = apps.find((a) => a.qrCode === qrCode);
    if (!app) {
      throw new NotFoundException('二维码无效');
    }

    if (app.status !== 'approved') {
      throw new BadRequestException('申请未通过审核');
    }

    if (!app.qrExpiresAt || new Date(app.qrExpiresAt) < new Date()) {
      throw new BadRequestException('二维码已过期');
    }

    return app;
  }
}
