import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { QuizDto } from '@module/quiz/application/dto/quiz.dto';
import { GetQuizUseCase } from '@module/quiz/application/usecases/get-quiz.usecase';
import { GetQuizCommand } from '@module/quiz/presentation/commands/get-quiz.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(GetQuizCommand)
export class GetQuizHandler implements ICommandHandler<GetQuizCommand, QuizDto> {
  constructor(private readonly getQuizUseCase: GetQuizUseCase) {
    console.log('[GetQuizHandler] GetQuizHandler 초기화');
  }

  async execute(command: GetQuizCommand): Promise<ICommandResult<QuizDto>> {
    console.log(`[GetQuizHandler] Command 실행 시작: quizId=${command.quizId}`);

    try {
      const quiz = await this.getQuizUseCase.execute(command.quizId);
      const quizDto = QuizDto.fromDomain(quiz);

      console.log('[GetQuizHandler] Command 실행 완료: 퀴즈 조회 성공');
      return {
        success: true,
        data: quizDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[GetQuizHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
