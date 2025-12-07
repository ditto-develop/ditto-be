import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { QuizSetDto } from '@module/quiz/application/dto/quiz-set.dto';
import { ActivateQuizSetUseCase } from '@module/quiz/application/usecases/activate-quiz-set.usecase';
import { ActivateQuizSetCommand } from '@module/quiz/presentation/commands/activate-quiz-set.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(ActivateQuizSetCommand)
export class ActivateQuizSetHandler implements ICommandHandler<ActivateQuizSetCommand, QuizSetDto> {
  constructor(private readonly activateQuizSetUseCase: ActivateQuizSetUseCase) {
    console.log('[ActivateQuizSetHandler] ActivateQuizSetHandler 초기화');
  }

  async execute(command: ActivateQuizSetCommand): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[ActivateQuizSetHandler] Command 실행 시작: id=${command.id}`);

    try {
      const quizSet = await this.activateQuizSetUseCase.execute(command.id);
      const quizSetDto = QuizSetDto.fromDomain(quizSet);

      console.log('[ActivateQuizSetHandler] Command 실행 완료: 퀴즈 세트 활성화 성공');
      return {
        success: true,
        data: quizSetDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[ActivateQuizSetHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
