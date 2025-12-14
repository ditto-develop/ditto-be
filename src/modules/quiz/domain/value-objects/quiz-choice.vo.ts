import { ValidationException } from '@common/exceptions/domain.exception';

/**
 * 퀴즈 선택지 값 객체
 * 불변성을 가지며, 비즈니스 규칙을 검증합니다.
 */
export class QuizChoice {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly order: number,
  ) {
    this.validate();
  }

  /**
   * QuizChoice 생성 팩토리 메서드
   */
  static create(id: string, content: string, order: number): QuizChoice {
    return new QuizChoice(id, content, order);
  }

  /**
   * 비즈니스 규칙 검증
   */
  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new ValidationException('선택지 ID는 필수 값입니다.');
    }

    if (!this.content || this.content.trim() === '') {
      throw new ValidationException('선택지 내용은 필수 값입니다.');
    }

    if (this.content.length > 500) {
      throw new ValidationException('선택지 내용은 500자를 초과할 수 없습니다.');
    }

    if (this.order < 1 || this.order > 2) {
      throw new ValidationException('선택지 순서는 1 또는 2여야 합니다.');
    }
  }

  /**
   * 선택지 내용 업데이트 (새 인스턴스 반환)
   */
  updateContent(newContent: string): QuizChoice {
    return new QuizChoice(this.id, newContent, this.order);
  }

  /**
   * 선택지 순서 업데이트 (새 인스턴스 반환)
   */
  updateOrder(newOrder: number): QuizChoice {
    return new QuizChoice(this.id, this.content, newOrder);
  }

  /**
   * 값 객체 비교 (ID 기반)
   */
  equals(other: QuizChoice): boolean {
    return this.id === other.id;
  }

  /**
   * 값 객체를 일반 객체로 변환 (DTO용)
   */
  toPlainObject() {
    return {
      id: this.id,
      content: this.content,
      order: this.order,
    };
  }
}
