import { CommandBusModule } from '@common/command/command-bus.module';
import configuration from '@config/configuration';
import { CommonModule } from '@module/common/common.module';
import { PrismaModule } from '@module/common/prisma/prisma.module';
import { RedisModule } from '@module/common/redis/redis.module';
import { QuizModule } from '@module/quiz/quiz.module';
import { RoleModule } from '@module/role/role.module';
import { UserModule } from '@module/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from '@config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    RedisModule,
    CommonModule,
    CommandBusModule,
    RoleModule,
    UserModule,
    QuizModule,
  ],
})
export class AppModule {}
