import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { QuizSetDto } from '@module/quiz/application/dto/quiz-set.dto';
import { GetQuizSetCommand } from '@module/quiz/presentation/commands/get-quiz-set.command';
import { Injectable } from '@nestjs/common';
import { GetQuizSetUseCase } from '@module/quiz/application/usecases/get-quiz-set.usecase';
import { QuizDto } from '@module/quiz/application/dto/quiz.dto';

@Injectable()
@CommandHandler(GetQuizSetCommand)
export class GetQuizSetHandler implements ICommandHandler<GetQuizSetCommand, QuizSetDto & { quizzes?: QuizDto[] }> {
  constructor(private readonly getQuizSetUseCase: GetQuizSetUseCase) {}

  async execute(command: GetQuizSetCommand): Promise<ICommandResult<QuizSetDto & { quizzes?: QuizDto[] }>> {
    console.log(`[GetQuizSetHandler] Command 실행 시작: id=${command.id}`);

    try {
      const result = await this.getQuizSetUseCase.execute(command.id, true);

      console.log('[GetQuizSetHandler] Command 실행 완료: 퀴즈 세트 조회 성공 (퀴즈 포함)');
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[GetQuizSetHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
