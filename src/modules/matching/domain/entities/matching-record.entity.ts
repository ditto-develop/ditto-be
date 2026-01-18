import { ValidationException } from '@common/exceptions/domain.exception';

export class MatchingRecord {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly matchedUserId: string,
    public readonly quizSetId: string,
    public readonly year: number,
    public readonly month: number,
    public readonly week: number,
    public readonly isMatched: boolean,
    public readonly matchedAt: Date,
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
    isMatched: boolean = false,
    matchedAt: Date = new Date(),
  ): MatchingRecord {
    return new MatchingRecord(
      id,
      userId,
      matchedUserId,
      quizSetId,
      year,
      month,
      week,
      isMatched,
      matchedAt,
    );
  }

  /**
   * 비즈니스 규칙 검증
   */
  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new ValidationException('매칭 기록 ID는 필수 값입니다.');
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

    if (!this.matchedAt) {
      throw new ValidationException('매칭일시는 필수 값입니다.');
    }
  }

  /**
   * 매칭이 성사되었는지 확인
   */
  isMatchingSuccessful(): boolean {
    return this.isMatched;
  }

  /**
   * 매칭 상태를 업데이트한 새 인스턴스 반환
   */
  updateMatchingStatus(isMatched: boolean): MatchingRecord {
    return new MatchingRecord(
      this.id,
      this.userId,
      this.matchedUserId,
      this.quizSetId,
      this.year,
      this.month,
      this.week,
      isMatched,
      this.matchedAt,
    );
  }

  /**
   * 동일한 매칭 기록인지 확인 (양방향 고려)
   */
  equals(other: MatchingRecord): boolean {
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
   * 현재 주차의 매칭 기록인지 확인
   */
  isCurrentWeek(currentYear: number, currentMonth: number, currentWeek: number): boolean {
    return (
      this.year === currentYear &&
      this.month === currentMonth &&
      this.week === currentWeek
    );
  }

  /**
   * 한 주차에 한 명만 선택 가능한지 검증
   */
  canSelectInSameWeek(otherSelections: MatchingRecord[]): boolean {
    const sameWeekSelections = otherSelections.filter(
      record => record.isCurrentWeek(this.year, this.month, this.week) && record.userId === this.userId,
    );

    return sameWeekSelections.length === 0;
  }
}