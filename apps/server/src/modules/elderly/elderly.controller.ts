import { Controller, Get, Param } from '@nestjs/common';
import { ElderlyService } from './elderly.service';
import type { Elderly } from '../../common/types';

@Controller('elderly')
export class ElderlyController {
  constructor(private readonly elderlyService: ElderlyService) {}

  @Get()
  getAll(): Elderly[] {
    return this.elderlyService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): Elderly {
    return this.elderlyService.getById(id);
  }
}
