import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { QuizDto } from '@module/quiz/application/dto/quiz.dto';
import { UpdateQuizUseCase } from '@module/quiz/application/usecases/update-quiz.usecase';
import { UpdateQuizCommand } from '@module/quiz/presentation/commands/update-quiz.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(UpdateQuizCommand)
export class UpdateQuizHandler implements ICommandHandler<UpdateQuizCommand, QuizDto> {
  constructor(private readonly updateQuizUseCase: UpdateQuizUseCase) {
    console.log('[UpdateQuizHandler] UpdateQuizHandler 초기화');
  }

  async execute(command: UpdateQuizCommand): Promise<ICommandResult<QuizDto>> {
    console.log(`[UpdateQuizHandler] Command 실행 시작: quizId=${command.quizId}`);

    try {
      const quiz = await this.updateQuizUseCase.execute(command.quizId, command.dto);
      const quizDto = QuizDto.fromDomain(quiz);

      console.log('[UpdateQuizHandler] Command 실행 완료: 퀴즈 수정 성공');
      return {
        success: true,
        data: quizDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[UpdateQuizHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
