import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommandBusModule } from 'src/common/command/command-bus.module';
import configuration from 'src/config/configuration';
import { validate } from 'src/config/env.validation';
import { CommonModule } from 'src/modules/common/common.module';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { QuizModule } from 'src/modules/quiz/quiz.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    CommonModule,
    CommandBusModule,
    QuizModule,
  ],
})
export class AppModule {}
