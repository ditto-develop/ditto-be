import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ResetWeekProgressCommand } from '../reset-week-progress.command';
import { ResetWeekProgressUseCase } from '@module/quiz/application/usecases/reset-week-progress.usecase';
import { ICommandResult } from '@common/command/command.interface';

@Injectable()
@CommandHandler(ResetWeekProgressCommand)
export class ResetWeekProgressHandler implements ICommandHandler<ResetWeekProgressCommand, void> {
  constructor(private readonly resetWeekProgressUseCase: ResetWeekProgressUseCase) {}

  async execute(command: ResetWeekProgressCommand): Promise<ICommandResult<void>> {
    try {
      await this.resetWeekProgressUseCase.execute(command.userId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
