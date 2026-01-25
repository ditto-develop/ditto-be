import { ValidationException } from '@common/exceptions/domain.exception';

/**
 * 매칭 상태 값 객체
 */
export enum MatchingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class MatchingStatusValueObject {
  constructor(private readonly _value: MatchingStatus) {
    this.validate();
  }

  static create(status: string): MatchingStatusValueObject {
    const validStatuses = Object.values(MatchingStatus);
    if (!validStatuses.includes(status as MatchingStatus)) {
      throw new ValidationException(`유효하지 않은 매칭 상태입니다: ${status}`);
    }
    return new MatchingStatusValueObject(status as MatchingStatus);
  }

  get value(): MatchingStatus {
    return this._value;
  }

  isPending(): boolean {
    return this._value === MatchingStatus.PENDING;
  }

  isProcessing(): boolean {
    return this._value === MatchingStatus.PROCESSING;
  }

  isCompleted(): boolean {
    return this._value === MatchingStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this._value === MatchingStatus.FAILED;
  }

  private validate(): void {
    // 이미 create에서 검증하므로 추가 검증 불필요
  }

  equals(other: MatchingStatusValueObject): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}