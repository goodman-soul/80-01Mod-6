import { Module } from '@nestjs/common';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
})
export class FamilyModule {}
