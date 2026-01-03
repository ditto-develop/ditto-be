import { Inject, Injectable } from '@nestjs/common';
import {
  USER_QUIZ_PROGRESS_REPOSITORY_TOKEN,
  IUserQuizProgressRepository,
} from '@module/quiz/infrastructure/repository/user-quiz-progress.repository.interface';
import {
  QUIZ_ANSWER_REPOSITORY_TOKEN,
  IQuizAnswerRepository,
} from '@module/quiz/infrastructure/repository/quiz-answer.repository.interface';
import {
  QUIZ_SET_REPOSITORY_TOKEN,
  IQuizSetRepository,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { QuizProgressStatus } from '@module/quiz/domain/value-objects/quiz-progress-status.vo';

export interface QuizProgressResponse {
  status: QuizProgressStatus;
  quizSetId: string | null;
  quizSetTitle: string | null;
  totalQuizzes: number;
  answeredQuizzes: number;
}

@Injectable()
export class GetQuizProgressUseCase {
  constructor(
    @Inject(USER_QUIZ_PROGRESS_REPOSITORY_TOKEN)
    private readonly userQuizProgressRepository: IUserQuizProgressRepository,
    @Inject(QUIZ_ANSWER_REPOSITORY_TOKEN)
    private readonly quizAnswerRepository: IQuizAnswerRepository,
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
    private readonly systemStateService: SystemStateService,
  ) {}

  async execute(userId: string): Promise<QuizProgressResponse> {
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    const progress = await this.userQuizProgressRepository.findByUserIdAndYearMonthWeek(
      userId,
      year,
      month,
      week,
    );

    if (!progress) {
      return {
        status: QuizProgressStatus.NOT_STARTED,
        quizSetId: null,
        quizSetTitle: null,
        totalQuizzes: 0,
        answeredQuizzes: 0,
      };
    }

    const quizSet = await this.quizSetRepository.findById(progress.quizSetId);
    const totalQuizzes = await this.quizAnswerRepository.countByQuizSetId(progress.quizSetId);
    const answers = await this.quizAnswerRepository.findByUserIdAndQuizSetId(userId, progress.quizSetId);

    return {
      status: progress.status,
      quizSetId: progress.quizSetId,
      quizSetTitle: quizSet?.title || null,
      totalQuizzes,
      answeredQuizzes: answers.length,
    };
  }
}
