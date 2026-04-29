import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // 软删除辅助方法
  async softDelete<T>(
    model: keyof this,
    where: Record<string, unknown>,
  ): Promise<T> {
    const now = new Date();
    return (this[model] as any).update({
      where,
      data: { deletedAt: now },
    });
  }

  // 批量软删除
  async softDeleteMany<T>(
    model: keyof this,
    where: Record<string, unknown>,
  ): Promise<{ count: number }> {
    const now = new Date();
    return (this[model] as any).updateMany({
      where,
      data: { deletedAt: now },
    });
  }
}
