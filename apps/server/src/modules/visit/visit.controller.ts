import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { VisitService } from './visit.service';
import type { VisitApplication } from '../../common/types';

@Controller('visit')
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Get()
  getApplications(
    @Query('elderlyId') elderlyId?: string,
    @Query('status') status?: string,
  ): VisitApplication[] {
    return this.visitService.getApplications(elderlyId, status);
  }

  @Get(':id')
  getApplication(@Param('id') id: string): VisitApplication {
    return this.visitService.getApplication(id);
  }

  @Post()
  createApplication(
    @Body()
    body: {
      elderlyId: string;
      applicantName: string;
      applicantPhone: string;
      relation: string;
      visitDate: string;
      visitTime: string;
      reason: string;
    },
  ): VisitApplication {
    return this.visitService.createApplication(body);
  }

  @Put(':id/approve')
  approveApplication(
    @Param('id') id: string,
    @Body() body: { stewardId: string; stewardName: string },
  ): VisitApplication {
    return this.visitService.approveApplication(
      id,
      body.stewardId,
      body.stewardName,
    );
  }

  @Put(':id/reject')
  rejectApplication(
    @Param('id') id: string,
    @Body()
    body: { stewardId: string; stewardName: string; rejectReason: string },
  ): VisitApplication {
    return this.visitService.rejectApplication(
      id,
      body.stewardId,
      body.stewardName,
      body.rejectReason,
    );
  }

  @Get(':id/qrcode')
  getQRCode(
    @Param('id') id: string,
  ): { qrCode: string; expiresAt: string } {
    return this.visitService.getQRCode(id);
  }

  @Post('verify')
  verifyQRCode(
    @Body() body: { qrCode: string },
  ): VisitApplication {
    return this.visitService.verifyQRCode(body.qrCode);
  }
}
