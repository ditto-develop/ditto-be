import { CommandBusModule } from '@common/command/command-bus.module';
import configuration from '@config/configuration';
import { CommonModule } from '@module/common/common.module';
import { LoggingModule } from '@common/logging/logging.module';
import { PrismaModule } from '@module/common/prisma/prisma.module';
import { RedisModule } from '@module/common/redis/redis.module';
import { QuizModule } from '@module/quiz/quiz.module';
import { RoleModule } from '@module/role/role.module';
import { SystemModule } from '@module/system/system.module';
import { UserModule } from '@module/user/user.module';
import { MatchingModule } from '@module/matching/matching.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { validate } from '@config/env.validation';
import { AuthModule } from '@module/auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
import Redis from 'ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggingModule.forRoot(), // 로깅 모듈 (가장 먼저 로드되어야 함)
    AuthModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get('redis');

        // BullMQ는 blocking 명령어를 사용하므로 maxRetriesPerRequest를 null로 설정해야 함
        const bullRedisClient = new Redis({
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.db,
          maxRetriesPerRequest: null, // BullMQ 필수 설정
          lazyConnect: true,
          retryStrategy: (times) => Math.min(times * 100, 2000),
        });

        bullRedisClient.on('connect', () => {
          console.log('[BullMQ] Redis 연결 성공');
        });

        bullRedisClient.on('error', (error) => {
          console.error('[BullMQ] Redis 연결 오류:', error.message);
        });

        return {
          connection: bullRedisClient as any,
        } as any;
      },
    }),
    CommonModule,
    CommandBusModule,
    RoleModule,
    UserModule,
    QuizModule,
    SystemModule,
    MatchingModule,
  ],
})
export class AppModule {}
