import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { QuizSetDto } from '@module/quiz/application/dto/quiz-set.dto';
import {
  QUIZ_SET_REPOSITORY_TOKEN,
  IQuizSetRepository,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { GetQuizSetCommand } from '@module/quiz/presentation/commands/get-quiz-set.command';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
@CommandHandler(GetQuizSetCommand)
export class GetQuizSetHandler implements ICommandHandler<GetQuizSetCommand, QuizSetDto> {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {
    console.log('[GetQuizSetHandler] GetQuizSetHandler 초기화');
  }

  async execute(command: GetQuizSetCommand): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[GetQuizSetHandler] Command 실행 시작: id=${command.id}`);

    try {
      const quizSet = await this.quizSetRepository.findById(command.id);

      if (!quizSet) {
        throw new Error(`퀴즈 세트를 찾을 수 없습니다: ${command.id}`);
      }

      const quizSetDto = QuizSetDto.fromDomain(quizSet);

      console.log('[GetQuizSetHandler] Command 실행 완료: 퀴즈 세트 조회 성공');
      return {
        success: true,
        data: quizSetDto,
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
