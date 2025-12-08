import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { LogoutUseCase } from '@module/user/application/usecases/logout.usecase';
import { LogoutCommand } from '@module/user/presentation/commands/logout.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(private readonly useCase: LogoutUseCase) {}

  async execute(command: LogoutCommand): Promise<ICommandResult<void>> {
    try {
      await this.useCase.execute(command.refreshToken);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return { success: false, error: message };
    }
  }
}
