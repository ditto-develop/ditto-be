import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { QuizDto } from '@module/quiz/application/dto/quiz.dto';
import { GetAllQuizzesUseCase } from '@module/quiz/application/usecases/get-all-quizzes.usecase';
import { GetAllQuizzesCommand } from '@module/quiz/presentation/commands/get-all-quizzes.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(GetAllQuizzesCommand)
export class GetAllQuizzesHandler implements ICommandHandler<GetAllQuizzesCommand, QuizDto[]> {
  constructor(private readonly getAllQuizzesUseCase: GetAllQuizzesUseCase) {
    console.log('[GetAllQuizzesHandler] GetAllQuizzesHandler 초기화');
  }

  async execute(_: GetAllQuizzesCommand): Promise<ICommandResult<QuizDto[]>> {
    console.log('[GetAllQuizzesHandler] Command 실행 시작');

    try {
      const quizzes = await this.getAllQuizzesUseCase.execute();
      const quizDtos = quizzes.map((quiz) => QuizDto.fromDomain(quiz));

      console.log(`[GetAllQuizzesHandler] Command 실행 완료: ${quizDtos.length}개 Quiz 조회`);
      return {
        success: true,
        data: quizDtos,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[GetAllQuizzesHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

