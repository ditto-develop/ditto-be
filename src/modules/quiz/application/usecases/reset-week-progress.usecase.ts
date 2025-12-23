import { Inject, Injectable } from '@nestjs/common';
import {
  QUIZ_ANSWER_REPOSITORY_TOKEN,
  IQuizAnswerRepository,
} from '@module/quiz/infrastructure/repository/quiz-answer.repository.interface';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { SystemPeriod } from '@module/quiz/domain/value-objects/system-period.vo';
import { QuizPeriodException } from '@module/quiz/domain/exceptions/quiz.exceptions';

@Injectable()
export class ResetWeekProgressUseCase {
  constructor(
    @Inject(QUIZ_ANSWER_REPOSITORY_TOKEN)
    private readonly quizAnswerRepository: IQuizAnswerRepository,
    private readonly systemStateService: SystemStateService,
  ) {}

  async execute(userId: string): Promise<void> {
    // 1. 기간 확인
    const period = await this.systemStateService.getCurrentPeriod();
    if (period !== SystemPeriod.QUIZ) {
      throw new QuizPeriodException('퀴즈 기간에만 초기화할 수 있습니다.');
    }

    // 2. 현재 주차의 진행 상태 및 답변 삭제
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    await this.quizAnswerRepository.deleteByUserIdAndYearMonthWeek(userId, year, month, week);
  }
}
