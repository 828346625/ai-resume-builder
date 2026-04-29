import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ResumeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取用户简历计数
   */
  async countByUser(userId: number): Promise<number> {
    return this.prisma.resume.count({
      where: { userId, deletedAt: null },
    });
  }

  /**
   * 获取用户默认简历
   */
  async findDefaultByUser(userId: number) {
    return this.prisma.resume.findFirst({
      where: { userId, isDefault: true, deletedAt: null },
    });
  }
}
