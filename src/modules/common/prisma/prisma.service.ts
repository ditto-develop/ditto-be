import { Injectable, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { applyPrismaLoggingMiddleware } from '@common/logging/middleware/prisma-logging.middleware';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {
    super({
      log: ['error', 'warn'],
    });
    console.log('[PrismaService] PrismaService 초기화');
  }

  async onModuleInit(): Promise<void> {
    // 로깅 미들웨어 적용
    applyPrismaLoggingMiddleware(this, this.logger);

    await this.$connect();
    this.logger.log('Prisma 데이터베이스 연결 성공', 'PrismaService');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
