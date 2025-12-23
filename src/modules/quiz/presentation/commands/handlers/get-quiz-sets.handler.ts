import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { QuizSetGroupedResponseDto } from '@module/quiz/application/dto/quiz-set-grouped-response.dto';
import { GetQuizSetsUseCase } from '@module/quiz/application/usecases/get-quiz-sets.usecase';
import { GetQuizSetsCommand } from '@module/quiz/presentation/commands/get-quiz-sets.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(GetQuizSetsCommand)
export class GetQuizSetsHandler implements ICommandHandler<GetQuizSetsCommand, QuizSetGroupedResponseDto> {
  constructor(private readonly getQuizSetsUseCase: GetQuizSetsUseCase) {
    console.log('[GetQuizSetsHandler] GetQuizSetsHandler 초기화');
  }

  async execute(command: GetQuizSetsCommand): Promise<ICommandResult<QuizSetGroupedResponseDto>> {
    console.log(`[GetQuizSetsHandler] Command 실행 시작: query=${JSON.stringify(command.query)}`);

    try {
      const groupedData = await this.getQuizSetsUseCase.execute(command.query);

      console.log('[GetQuizSetsHandler] Command 실행 완료: 퀴즈 세트 목록 조회 성공');
      return {
        success: true,
        data: groupedData,
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
