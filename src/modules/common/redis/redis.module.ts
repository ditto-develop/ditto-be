import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis => {
        const redisConfig = configService.get('redis');
        console.log(`[RedisModule] Redis 연결 시도: ${redisConfig.host}:${redisConfig.port}`);

        const client = new Redis({
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.db,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          retryStrategy: (times) => Math.min(times * 100, 2000),
        });

        client.on('connect', () => {
          console.log('[RedisModule] Redis 연결 성공');
        });

        client.on('error', (error) => {
          console.error('[RedisModule] Redis 연결 오류:', error.message);
        });

        client.on('ready', () => {
          console.log('[RedisModule] Redis 클라이언트 준비 완료');
        });

        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
