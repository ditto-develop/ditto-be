import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { QuizSetDto } from '@module/quiz/application/dto/quiz-set.dto';
import { UpdateQuizSetUseCase } from '@module/quiz/application/usecases/update-quiz-set.usecase';
import { UpdateQuizSetCommand } from '@module/quiz/presentation/commands/update-quiz-set.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(UpdateQuizSetCommand)
export class UpdateQuizSetHandler implements ICommandHandler<UpdateQuizSetCommand, QuizSetDto> {
  constructor(private readonly updateQuizSetUseCase: UpdateQuizSetUseCase) {
    console.log('[UpdateQuizSetHandler] UpdateQuizSetHandler 초기화');
  }

  async execute(command: UpdateQuizSetCommand): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[UpdateQuizSetHandler] Command 실행 시작: id=${command.id}`);

    try {
      const quizSet = await this.updateQuizSetUseCase.execute(command.id, command.dto);
      const quizSetDto = QuizSetDto.fromDomain(quizSet);

      console.log('[UpdateQuizSetHandler] Command 실행 완료: 퀴즈 세트 수정 성공');
      return {
        success: true,
        data: quizSetDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[UpdateQuizSetHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
