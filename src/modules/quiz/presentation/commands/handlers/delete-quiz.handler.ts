import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { DeleteQuizUseCase } from '@module/quiz/application/usecases/delete-quiz.usecase';
import { DeleteQuizCommand } from '@module/quiz/presentation/commands/delete-quiz.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(DeleteQuizCommand)
export class DeleteQuizHandler implements ICommandHandler<DeleteQuizCommand, void> {
  constructor(private readonly deleteQuizUseCase: DeleteQuizUseCase) {
    console.log('[DeleteQuizHandler] DeleteQuizHandler 초기화');
  }

  async execute(command: DeleteQuizCommand): Promise<ICommandResult<void>> {
    console.log(`[DeleteQuizHandler] Command 실행 시작: quizId=${command.quizId}`);

    try {
      await this.deleteQuizUseCase.execute(command.quizId);

      console.log('[DeleteQuizHandler] Command 실행 완료: 퀴즈 삭제 성공');
      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[DeleteQuizHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
