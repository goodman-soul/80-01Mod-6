import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { Elderly } from '../../common/types';

@Injectable()
export class ElderlyService {
  constructor(private readonly db: DatabaseService) {}

  getAll(): Elderly[] {
    return this.db.getAllElderly();
  }

  getById(id: string): Elderly {
    const elderly = this.db.getElderly(id);
    if (!elderly) {
      throw new NotFoundException('老人信息不存在');
    }
    return elderly;
  }
}
