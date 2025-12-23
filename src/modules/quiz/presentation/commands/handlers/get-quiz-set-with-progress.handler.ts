import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { GetQuizSetWithProgressCommand } from '../get-quiz-set-with-progress.command';
import { GetQuizSetWithProgressUseCase } from '@module/quiz/application/usecases/get-quiz-set-with-progress.usecase';
import { ICommandResult } from '@common/command/command.interface';

@Injectable()
@CommandHandler(GetQuizSetWithProgressCommand)
export class GetQuizSetWithProgressHandler implements ICommandHandler<GetQuizSetWithProgressCommand, any> {
  constructor(private readonly getQuizSetWithProgressUseCase: GetQuizSetWithProgressUseCase) {}

  async execute(command: GetQuizSetWithProgressCommand): Promise<ICommandResult<any>> {
    try {
      const result = await this.getQuizSetWithProgressUseCase.execute(command.userId, command.quizSetId);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
