import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { QuizAnswer } from '@module/quiz/domain/entities/quiz-answer.entity';
import { UserQuizProgress } from '@module/quiz/domain/entities/user-quiz-progress.entity';
import {
  QUIZ_ANSWER_REPOSITORY_TOKEN,
  IQuizAnswerRepository,
} from '@module/quiz/infrastructure/repository/quiz-answer.repository.interface';
import {
  USER_QUIZ_PROGRESS_REPOSITORY_TOKEN,
  IUserQuizProgressRepository,
} from '@module/quiz/infrastructure/repository/user-quiz-progress.repository.interface';
import {
  QUIZ_REPOSITORY_TOKEN,
  IQuizRepository,
} from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { QuizProgressStatus } from '@module/quiz/domain/value-objects/quiz-progress-status.vo';
import { SystemPeriod } from '@module/quiz/domain/value-objects/system-period.vo';
import { QuizNotFoundException, QuizPeriodException } from '@module/quiz/domain/exceptions/quiz.exceptions';

@Injectable()
export class SubmitQuizAnswerUseCase {
  constructor(
    @Inject(QUIZ_ANSWER_REPOSITORY_TOKEN)
    private readonly quizAnswerRepository: IQuizAnswerRepository,
    @Inject(USER_QUIZ_PROGRESS_REPOSITORY_TOKEN)
    private readonly userQuizProgressRepository: IUserQuizProgressRepository,
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
    private readonly systemStateService: SystemStateService,
  ) {}

  async execute(userId: string, quizId: string, choiceId: string): Promise<void> {
    // 1. 기간 확인
    const period = await this.systemStateService.getCurrentPeriod();
    if (period !== SystemPeriod.QUIZ) {
      throw new QuizPeriodException();
    }

    // 2. 퀴즈 존재 여부 및 세트 확인
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new QuizNotFoundException(quizId);
    }

    // 3. 사용자 진행 상태 확인
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    let progress = await this.userQuizProgressRepository.findByUserIdAndYearMonthWeek(
      userId,
      year,
      month,
      week,
    );

    if (progress) {
      // 이미 완료된 경우 수정 불가
      progress.assertCanUpdate();

      // 다른 세트의 퀴즈라면? (한 주차엔 한 세트만 풀 수 있음)
      if (progress.quizSetId !== quiz.quizSetId) {
        throw new QuizPeriodException('이번 주차에 선택한 퀴즈 세트의 문제가 아닙니다.');
      }
    } else {
      // 처음 시작하는 경우 진행 상태 생성
      progress = UserQuizProgress.create(uuidv4(), userId, year, month, week, quiz.quizSetId);
      await this.userQuizProgressRepository.create(progress);
    }

    // 4. 답변 저장 또는 업데이트
    const existingAnswer = await this.quizAnswerRepository.findByUserIdAndQuizId(userId, quizId);
    if (existingAnswer) {
      const updatedAnswer = existingAnswer.updateChoice(choiceId);
      await this.quizAnswerRepository.update(updatedAnswer);
    } else {
      const newAnswer = QuizAnswer.create(uuidv4(), userId, quizId, choiceId);
      await this.quizAnswerRepository.create(newAnswer);
    }

    // 5. 진행 상태 업데이트 (모든 문제를 풀었는지 확인)
    const totalQuizzes = await this.quizAnswerRepository.countByQuizSetId(quiz.quizSetId);
    const answers = await this.quizAnswerRepository.findByUserIdAndQuizSetId(userId, quiz.quizSetId);

    if (answers.length === totalQuizzes) {
      await this.userQuizProgressRepository.update(progress.complete());
    } else if (progress.status === QuizProgressStatus.NOT_STARTED) {
      await this.userQuizProgressRepository.update(progress.start());
    }
  }
}
