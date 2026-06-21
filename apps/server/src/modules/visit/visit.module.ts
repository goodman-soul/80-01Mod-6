import { Module } from '@nestjs/common';
import { VisitController } from './visit.controller';
import { VisitService } from './visit.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [VisitController],
  providers: [VisitService],
  exports: [VisitService],
})
export class VisitModule {}
