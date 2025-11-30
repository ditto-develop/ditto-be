import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'src/common/command/command-handler.decorator';
import { ICommandHandler } from 'src/common/command/command-handler.interface';
import { ICommandResult } from 'src/common/command/command.interface';
import { DeleteQuizSetUseCase } from 'src/modules/quiz/application/usecases/delete-quiz-set.usecase';
import { DeleteQuizSetCommand } from 'src/modules/quiz/presentation/commands/delete-quiz-set.command';

@Injectable()
@CommandHandler(DeleteQuizSetCommand)
export class DeleteQuizSetHandler
  implements ICommandHandler<DeleteQuizSetCommand, void>
{
  constructor(private readonly deleteQuizSetUseCase: DeleteQuizSetUseCase) {
    console.log('[DeleteQuizSetHandler] DeleteQuizSetHandler 초기화');
  }

  async execute(command: DeleteQuizSetCommand): Promise<ICommandResult<void>> {
    console.log(`[DeleteQuizSetHandler] Command 실행 시작: id=${command.id}`);

    try {
      await this.deleteQuizSetUseCase.execute(command.id);

      console.log(
        '[DeleteQuizSetHandler] Command 실행 완료: 퀴즈 세트 삭제 성공',
      );
      return {
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';
      console.error(`[DeleteQuizSetHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
