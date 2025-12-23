import { Module, OnModuleInit } from '@nestjs/common';
import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { CommonModule } from '@module/common/common.module';
import { RedisModule } from '@module/common/redis/redis.module';
import { QuizModule } from '@module/quiz/quiz.module';
import { UserModule } from '@module/user/user.module';
import { GetSystemStateUseCase } from './application/usecases/get-system-state.usecase';
import { GetSystemStateHandler } from './presentation/commands/handlers/get-system-state.handler';
import { SystemController } from './presentation/controller/system.controller';

@Module({
  imports: [CommandBusModule, CommonModule, RedisModule, QuizModule, UserModule],
  controllers: [SystemController],
  providers: [GetSystemStateUseCase, GetSystemStateHandler],
})
export class SystemModule implements OnModuleInit {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly getSystemStateHandler: GetSystemStateHandler,
  ) {}

  onModuleInit(): void {
    registerCommandHandlers(
      this.commandBus,
      [{ handler: this.getSystemStateHandler, class: GetSystemStateHandler }],
      'SystemModule',
    );
  }
}
