import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { QuizSetDto } from '@module/quiz/application/dto/quiz-set.dto';
import { ReorderQuizzesUseCase } from '@module/quiz/application/usecases/reorder-quizzes.usecase';
import { ReorderQuizzesCommand } from '@module/quiz/presentation/commands/reorder-quizzes.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(ReorderQuizzesCommand)
export class ReorderQuizzesHandler implements ICommandHandler<ReorderQuizzesCommand, QuizSetDto> {
  constructor(private readonly reorderQuizzesUseCase: ReorderQuizzesUseCase) {}

  async execute(command: ReorderQuizzesCommand): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[ReorderQuizzesHandler] Command 실행 시작: quizSetId=${command.quizSetId}`);

    try {
      const quizSet = await this.reorderQuizzesUseCase.execute(command.quizSetId, command.dto);
      const quizSetDto = QuizSetDto.fromDomain(quizSet);

      console.log('[ReorderQuizzesHandler] Command 실행 완료: 퀴즈 순서 변경 성공');
      return {
        success: true,
        data: quizSetDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[ReorderQuizzesHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

