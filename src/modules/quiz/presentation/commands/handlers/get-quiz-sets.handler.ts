import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { QuizSetDto } from '@module/quiz/application/dto/quiz-set.dto';
import {
  QUIZ_SET_REPOSITORY_TOKEN,
  IQuizSetRepository,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { GetQuizSetsCommand } from '@module/quiz/presentation/commands/get-quiz-sets.command';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
@CommandHandler(GetQuizSetsCommand)
export class GetQuizSetsHandler implements ICommandHandler<GetQuizSetsCommand, QuizSetDto[]> {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {
    console.log('[GetQuizSetsHandler] GetQuizSetsHandler 초기화');
  }

  async execute(command: GetQuizSetsCommand): Promise<ICommandResult<QuizSetDto[]>> {
    console.log(`[GetQuizSetsHandler] Command 실행 시작: query=${JSON.stringify(command.query)}`);

    try {
      const { week, category, isActive } = command.query;

      // 다중 필터로 QuizSet 목록 조회 (모든 조건을 AND로 적용)
      const quizSets = await this.quizSetRepository.findByFilters(week, category, isActive);

      const quizSetDtos = quizSets.map((quizSet) => QuizSetDto.fromDomain(quizSet));

      console.log('[GetQuizSetsHandler] Command 실행 완료: 퀴즈 세트 목록 조회 성공');
      return {
        success: true,
        data: quizSetDtos,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[GetQuizSetsHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
