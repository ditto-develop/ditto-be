import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'src/common/command/command-handler.decorator';
import { ICommandHandler } from 'src/common/command/command-handler.interface';
import { ICommandResult } from 'src/common/command/command.interface';
import { QuizDto } from 'src/modules/quiz/application/dto/quiz.dto';
import { CreateQuizUseCase } from 'src/modules/quiz/application/usecases/create-quiz.usecase';
import { CreateQuizCommand } from 'src/modules/quiz/presentation/commands/create-quiz.command';

@Injectable()
@CommandHandler(CreateQuizCommand)
export class CreateQuizHandler
  implements ICommandHandler<CreateQuizCommand, QuizDto>
{
  constructor(private readonly createQuizUseCase: CreateQuizUseCase) {
    console.log('[CreateQuizHandler] CreateQuizHandler 초기화');
  }

  async execute(command: CreateQuizCommand): Promise<ICommandResult<QuizDto>> {
    console.log(
      `[CreateQuizHandler] Command 실행 시작: question=${command.dto.question}`,
    );

    try {
      const quiz = await this.createQuizUseCase.execute(command.dto);
      const quizDto = QuizDto.fromDomain(quiz);

      console.log('[CreateQuizHandler] Command 실행 완료: 퀴즈 생성 성공');
      return {
        success: true,
        data: quizDto,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';
      console.error(`[CreateServerHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
