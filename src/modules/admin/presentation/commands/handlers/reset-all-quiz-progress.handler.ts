import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { ResetAllQuizProgressCommand } from '../reset-all-quiz-progress.command';
import { ResetAllQuizProgressUseCase } from '@module/admin/application/usecases/reset-all-quiz-progress.usecase';

@Injectable()
@CommandHandler(ResetAllQuizProgressCommand)
export class ResetAllQuizProgressHandler
  implements ICommandHandler<ResetAllQuizProgressCommand, { deletedAnswers: number; deletedProgress: number }>
{
  constructor(private readonly resetAllQuizProgressUseCase: ResetAllQuizProgressUseCase) {}

  async execute(
    _: ResetAllQuizProgressCommand,
  ): Promise<ICommandResult<{ deletedAnswers: number; deletedProgress: number }>> {
    try {
      const data = await this.resetAllQuizProgressUseCase.execute();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
