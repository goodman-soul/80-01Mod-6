import { Module } from '@nestjs/common';
import { ElderlyController } from './elderly.controller';
import { ElderlyService } from './elderly.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ElderlyController],
  providers: [ElderlyService],
  exports: [ElderlyService],
})
export class ElderlyModule {}
