import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetCurrentWeekQuizSetsUseCase } from '@module/quiz/application/usecases/get-current-week-quiz-sets.usecase';
import { GetCurrentWeekQuizSetsCommand } from '@module/quiz/presentation/commands/get-current-week-quiz-sets.command';
import { CurrentWeekQuizSetsResponseDto } from '@module/quiz/application/dto/current-week-quiz-sets-response.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(GetCurrentWeekQuizSetsCommand)
export class GetCurrentWeekQuizSetsHandler
  implements ICommandHandler<GetCurrentWeekQuizSetsCommand, CurrentWeekQuizSetsResponseDto>
{
  constructor(private readonly getCurrentWeekQuizSetsUseCase: GetCurrentWeekQuizSetsUseCase) {}

  async execute(_command: GetCurrentWeekQuizSetsCommand): Promise<ICommandResult<CurrentWeekQuizSetsResponseDto>> {
    console.log('[GetCurrentWeekQuizSetsHandler] Command 실행 시작');

    try {
      const result = await this.getCurrentWeekQuizSetsUseCase.execute();

      console.log('[GetCurrentWeekQuizSetsHandler] Command 실행 완료: 이번 주차 퀴즈 세트 조회 성공');
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[GetCurrentWeekQuizSetsHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
