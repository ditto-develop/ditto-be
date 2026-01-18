import { ValidationException } from '@common/exceptions/domain.exception';

export class MatchingOpportunity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly matchedUserId: string,
    public readonly quizSetId: string,
    public readonly year: number,
    public readonly month: number,
    public readonly week: number,
    public readonly matchScore: number,
    public readonly createdAt: Date,
  ) {
    this.validate();
  }

  static create(
    id: string,
    userId: string,
    matchedUserId: string,
    quizSetId: string,
    year: number,
    month: number,
    week: number,
    matchScore: number,
    createdAt: Date = new Date(),
  ): MatchingOpportunity {
    return new MatchingOpportunity(
      id,
      userId,
      matchedUserId,
      quizSetId,
      year,
      month,
      week,
      matchScore,
      createdAt,
    );
  }

  /**
   * 비즈니스 규칙 검증
   */
  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new ValidationException('매칭 기회 ID는 필수 값입니다.');
    }

    if (!this.userId || this.userId.trim() === '') {
      throw new ValidationException('사용자 ID는 필수 값입니다.');
    }

    if (!this.matchedUserId || this.matchedUserId.trim() === '') {
      throw new ValidationException('매칭된 사용자 ID는 필수 값입니다.');
    }

    if (this.userId === this.matchedUserId) {
      throw new ValidationException('사용자와 매칭 사용자는 같을 수 없습니다.');
    }

    if (!this.quizSetId || this.quizSetId.trim() === '') {
      throw new ValidationException('퀴즈 세트 ID는 필수 값입니다.');
    }

    if (this.year < 2020 || this.year > 2100) {
      throw new ValidationException('올바르지 않은 년도입니다.');
    }

    if (this.month < 1 || this.month > 12) {
      throw new ValidationException('올바르지 않은 월입니다.');
    }

    if (this.week < 1 || this.week > 6) {
      throw new ValidationException('올바르지 않은 주차입니다.');
    }

    if (this.matchScore < 0 || this.matchScore > 12) {
      throw new ValidationException('매칭 점수는 0에서 12 사이여야 합니다.');
    }

    if (!this.createdAt) {
      throw new ValidationException('생성일시는 필수 값입니다.');
    }
  }

  /**
   * 동일한 매칭 기회인지 확인 (양방향 고려)
   */
  equals(other: MatchingOpportunity): boolean {
    const thisPair = [this.userId, this.matchedUserId].sort().join(':');
    const otherPair = [other.userId, other.matchedUserId].sort().join(':');

    return (
      thisPair === otherPair &&
      this.quizSetId === other.quizSetId &&
      this.year === other.year &&
      this.month === other.month &&
      this.week === other.week
    );
  }

  /**
   * 현재 주차의 매칭 기회인지 확인
   */
  isCurrentWeek(currentYear: number, currentMonth: number, currentWeek: number): boolean {
    return (
      this.year === currentYear &&
      this.month === currentMonth &&
      this.week === currentWeek
    );
  }
}