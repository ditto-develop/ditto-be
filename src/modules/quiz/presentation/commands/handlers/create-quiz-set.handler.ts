import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'src/common/command/command-handler.decorator';
import { ICommandHandler } from 'src/common/command/command-handler.interface';
import { ICommandResult } from 'src/common/command/command.interface';
import { QuizSetDto } from 'src/modules/quiz/application/dto/quiz-set.dto';
import { CreateQuizSetUseCase } from 'src/modules/quiz/application/usecases/create-quiz-set.usecase';
import { CreateQuizSetCommand } from 'src/modules/quiz/presentation/commands/create-quiz-set.command';

@Injectable()
@CommandHandler(CreateQuizSetCommand)
export class CreateQuizSetHandler
  implements ICommandHandler<CreateQuizSetCommand, QuizSetDto>
{
  constructor(private readonly createQuizSetUseCase: CreateQuizSetUseCase) {
    console.log('[CreateQuizSetHandler] CreateQuizSetHandler 초기화');
  }

  async execute(
    command: CreateQuizSetCommand,
  ): Promise<ICommandResult<QuizSetDto>> {
    console.log(
      `[CreateQuizSetHandler] Command 실행 시작: title=${command.dto.title}`,
    );

    try {
      const quizSet = await this.createQuizSetUseCase.execute(command.dto);
      const quizSetDto = QuizSetDto.fromDomain(quizSet);

      console.log(
        '[CreateQuizSetHandler] Command 실행 완료: 퀴즈 세트 생성 성공',
      );
      return {
        success: true,
        data: quizSetDto,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';
      console.error(`[CreateQuizSetHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
