import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'src/common/command/command-handler.decorator';
import { ICommandHandler } from 'src/common/command/command-handler.interface';
import { ICommandResult } from 'src/common/command/command.interface';
import { DeactivateQuizSetCommand } from 'src/modules/quiz/presentation/commands/deactivate-quiz-set.command';
import { DeactivateQuizSetUseCase } from 'src/modules/quiz/application/usecases/deactivate-quiz-set.usecase';

@Injectable()
@CommandHandler(DeactivateQuizSetCommand)
export class DeactivateQuizSetHandler
  implements ICommandHandler<DeactivateQuizSetCommand, void>
{
  constructor(
    private readonly deactivateQuizSetUseCase: DeactivateQuizSetUseCase,
  ) {
    console.log('[DeactivateQuizSetHandler] DeactivateQuizSetHandler 초기화');
  }

  async execute(
    command: DeactivateQuizSetCommand,
  ): Promise<ICommandResult<void>> {
    console.log(
      `[DeactivateQuizSetHandler] Command 실행 시작: id=${command.id}`,
    );

    try {
      await this.deactivateQuizSetUseCase.execute(command.id);

      console.log(
        '[DeactivateQuizSetHandler] Command 실행 완료: 퀴즈 세트 비활성화 성공',
      );
      return {
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';
      console.error(
        `[DeactivateQuizSetHandler] Command 실행 실패:`,
        errorMessage,
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
