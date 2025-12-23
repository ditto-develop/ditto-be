import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { SubmitQuizAnswerCommand } from '../submit-quiz-answer.command';
import { SubmitQuizAnswerUseCase } from '@module/quiz/application/usecases/submit-quiz-answer.usecase';
import { ICommandResult } from '@common/command/command.interface';

@Injectable()
@CommandHandler(SubmitQuizAnswerCommand)
export class SubmitQuizAnswerHandler implements ICommandHandler<SubmitQuizAnswerCommand, void> {
  constructor(private readonly submitQuizAnswerUseCase: SubmitQuizAnswerUseCase) {}

  async execute(command: SubmitQuizAnswerCommand): Promise<ICommandResult<void>> {
    try {
      await this.submitQuizAnswerUseCase.execute(command.userId, command.dto.quizId, command.dto.choiceId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
