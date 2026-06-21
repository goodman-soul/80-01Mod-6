import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ElderlyModule } from './modules/elderly/elderly.module';
import { FamilyModule } from './modules/family/family.module';
import { VisitModule } from './modules/visit/visit.module';
import { MessageModule } from './modules/message/message.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    CommonModule,
    ElderlyModule,
    FamilyModule,
    VisitModule,
    MessageModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
