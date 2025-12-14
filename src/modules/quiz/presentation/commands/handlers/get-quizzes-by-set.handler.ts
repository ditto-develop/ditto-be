import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { QuizDto } from '@module/quiz/application/dto/quiz.dto';
import { GetQuizzesBySetUseCase } from '@module/quiz/application/usecases/get-quizzes-by-set.usecase';
import { GetQuizzesBySetCommand } from '@module/quiz/presentation/commands/get-quizzes-by-set.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(GetQuizzesBySetCommand)
export class GetQuizzesBySetHandler implements ICommandHandler<GetQuizzesBySetCommand, QuizDto[]> {
  constructor(private readonly getQuizzesBySetUseCase: GetQuizzesBySetUseCase) {
    console.log('[GetQuizzesBySetHandler] GetQuizzesBySetHandler 초기화');
  }

  async execute(command: GetQuizzesBySetCommand): Promise<ICommandResult<QuizDto[]>> {
    console.log(`[GetQuizzesBySetHandler] Command 실행 시작: quizSetId=${command.quizSetId}`);

    try {
      const quizzes = await this.getQuizzesBySetUseCase.execute(command.quizSetId);
      const quizDtos = quizzes.map((quiz) => QuizDto.fromDomain(quiz));

      console.log('[GetQuizzesBySetHandler] Command 실행 완료: 퀴즈 목록 조회 성공');
      return {
        success: true,
        data: quizDtos,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[GetQuizzesBySetHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
