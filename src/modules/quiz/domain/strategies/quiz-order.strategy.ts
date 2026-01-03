/**
 * 퀴즈 순서 할당 전략 인터페이스
 */
export interface QuizOrderStrategy {
  /**
   * 퀴즈 세트에 대한 다음 순서를 계산
   * @param quizSetId 퀴즈 세트 ID
   * @returns 할당할 순서 번호
   */
  assignOrder(quizSetId: string): Promise<number>;
}

/**
 * 자동 순서 할당 전략
 * 세트의 최대 순서 + 1로 자동 할당
 */
export class AutoIncrementQuizOrderStrategy implements QuizOrderStrategy {
  constructor(private readonly findMaxOrderByQuizSetId: (quizSetId: string) => Promise<number>) {}

  async assignOrder(quizSetId: string): Promise<number> {
    const maxOrder = await this.findMaxOrderByQuizSetId(quizSetId);
    return maxOrder + 1;
  }
}

/**
 * 수동 순서 할당 전략
 * 지정된 순서를 그대로 사용
 */
export class ManualQuizOrderStrategy implements QuizOrderStrategy {
  constructor(private readonly specifiedOrder: number) {}

  async assignOrder(_quizSetId: string): Promise<number> {
    return this.specifiedOrder;
  }
}

/**
 * 퀴즈 순서 전략 팩토리
 */
export class QuizOrderStrategyFactory {
  /**
   * 순서 할당 전략 생성
   * @param specifiedOrder 지정된 순서 (null이면 자동 할당)
   * @param findMaxOrderByQuizSetId 최대 순서 조회 함수
   */
  static create(
    specifiedOrder: number | null | undefined,
    findMaxOrderByQuizSetId: (quizSetId: string) => Promise<number>,
  ): QuizOrderStrategy {
    if (specifiedOrder === null || specifiedOrder === undefined) {
      return new AutoIncrementQuizOrderStrategy(findMaxOrderByQuizSetId);
    } else {
      return new ManualQuizOrderStrategy(specifiedOrder);
    }
  }
}
