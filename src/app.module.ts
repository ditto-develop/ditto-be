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
import { ProfileModule } from '@module/profile/profile.module';
import { MatchingModule } from '@module/matching/matching.module';
import { RatingModule } from '@module/rating/rating.module';
import { ChatModule } from '@module/chat/chat.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { validate } from '@config/env.validation';
import { AuthModule } from '@module/auth/auth.module';
import { AppController } from './app.controller';

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
    CommonModule,
    CommandBusModule,
    RoleModule,
    UserModule,
    ProfileModule,
    MatchingModule,
    RatingModule,
    ChatModule,
    QuizModule,
    SystemModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
