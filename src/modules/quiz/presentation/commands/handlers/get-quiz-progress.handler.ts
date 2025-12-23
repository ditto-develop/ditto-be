import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { GetQuizProgressCommand } from '../get-quiz-progress.command';
import {
  GetQuizProgressUseCase,
  QuizProgressResponse,
} from '@module/quiz/application/usecases/get-quiz-progress.usecase';
import { ICommandResult } from '@common/command/command.interface';

@Injectable()
@CommandHandler(GetQuizProgressCommand)
export class GetQuizProgressHandler implements ICommandHandler<GetQuizProgressCommand, QuizProgressResponse> {
  constructor(private readonly getQuizProgressUseCase: GetQuizProgressUseCase) {}

  async execute(command: GetQuizProgressCommand): Promise<ICommandResult<QuizProgressResponse>> {
    try {
      const result = await this.getQuizProgressUseCase.execute(command.userId);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
