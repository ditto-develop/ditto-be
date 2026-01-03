import { BusinessRuleException } from '@common/exceptions/domain.exception';
import { QuizProgressStatus } from '../value-objects/quiz-progress-status.vo';

export class UserQuizProgress {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly year: number,
    public readonly month: number,
    public readonly week: number,
    public readonly quizSetId: string,
    public readonly status: QuizProgressStatus,
    public readonly selectedAt: Date,
    public readonly completedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    userId: string,
    year: number,
    month: number,
    week: number,
    quizSetId: string,
    status: QuizProgressStatus = QuizProgressStatus.NOT_STARTED,
    selectedAt: Date = new Date(),
    completedAt: Date | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ): UserQuizProgress {
    return new UserQuizProgress(
      id,
      userId,
      year,
      month,
      week,
      quizSetId,
      status,
      selectedAt,
      completedAt,
      createdAt,
      updatedAt,
    );
  }

  /**
   * 퀴즈 완료 처리
   */
  complete(): UserQuizProgress {
    if (this.status === QuizProgressStatus.COMPLETED) {
      return this;
    }

    return new UserQuizProgress(
      this.id,
      this.userId,
      this.year,
      this.month,
      this.week,
      this.quizSetId,
      QuizProgressStatus.COMPLETED,
      this.selectedAt,
      new Date(),
      this.createdAt,
      new Date(),
    );
  }

  /**
   * 진행 중 상태로 변경
   */
  start(): UserQuizProgress {
    if (this.status !== QuizProgressStatus.NOT_STARTED) {
      return this;
    }

    return new UserQuizProgress(
      this.id,
      this.userId,
      this.year,
      this.month,
      this.week,
      this.quizSetId,
      QuizProgressStatus.IN_PROGRESS,
      this.selectedAt,
      this.completedAt,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * 완료된 상태인지 확인
   */
  isCompleted(): boolean {
    return this.status === QuizProgressStatus.COMPLETED;
  }

  /**
   * 수정 가능 여부 확인
   */
  assertCanUpdate(): void {
    if (this.isCompleted()) {
      throw new BusinessRuleException('이미 퀴즈를 완료하여 수정할 수 없습니다.');
    }
  }
}
