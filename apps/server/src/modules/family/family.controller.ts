import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { FamilyService } from './family.service';
import type {
  FamilyMember,
  PermissionType,
  FamilyRelation,
} from '../../common/types';

@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get('elderly/:elderlyId')
  getFamilyMembers(@Param('elderlyId') elderlyId: string): FamilyMember[] {
    return this.familyService.getFamilyMembers(elderlyId);
  }

  @Get(':id')
  getFamilyMember(@Param('id') id: string): FamilyMember {
    return this.familyService.getFamilyMember(id);
  }

  @Post('elderly/:elderlyId')
  addFamilyMember(
    @Param('elderlyId') elderlyId: string,
    @Body()
    body: {
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
    return this.familyService.addFamilyMember(elderlyId, body);
  }

  @Put(':id/permissions')
  updatePermissions(
    @Param('id') id: string,
    @Body()
    body: {
      permissions: PermissionType[];
      operatorId: string;
      operatorName: string;
      remark?: string;
    },
  ): FamilyMember {
    return this.familyService.updatePermissions(
      id,
      body.permissions,
      body.operatorId,
      body.operatorName,
      body.remark,
    );
  }

  @Delete(':id')
  removeFamilyMember(
    @Param('id') id: string,
    @Body() body: { operatorId: string; operatorName: string },
  ): { success: boolean } {
    const success = this.familyService.removeFamilyMember(
      id,
      body.operatorId,
      body.operatorName,
    );
    return { success };
  }

  @Get('content/:familyMemberId/:type')
  getAuthorizedContent(
    @Param('familyMemberId') familyMemberId: string,
    @Param('type') type: PermissionType,
  ): unknown {
    return this.familyService.getAuthorizedContent(familyMemberId, type);
  }
}
