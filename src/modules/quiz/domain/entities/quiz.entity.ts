import { QuizChoice } from '../value-objects/quiz-choice.vo';
import {
  InvalidQuizChoicesException,
  InvalidQuizOrderException,
  DuplicateChoiceIdException,
} from '../exceptions/quiz.exceptions';

export class Quiz {
  constructor(
    public readonly id: string,
    public readonly question: string,
    public readonly choices: [QuizChoice, QuizChoice], // 정확히 2개의 선택지
    public readonly order: number,
    public readonly quizSetId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validateChoices();
  }

  static create(
    id: string,
    question: string,
    choices: [QuizChoice, QuizChoice],
    order: number,
    quizSetId: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ): Quiz {
    return new Quiz(id, question, choices, order, quizSetId, createdAt, updatedAt);
  }

  update(question: string, choices: [QuizChoice, QuizChoice], order: number): Quiz {
    return new Quiz(this.id, question, choices, order, this.quizSetId, this.createdAt, new Date());
  }

  updateOrder(newOrder: number): Quiz {
    return new Quiz(this.id, this.question, this.choices, newOrder, this.quizSetId, this.createdAt, new Date());
  }

  /**
   * 선택지 검증: 정확히 2개인지 확인
   */
  private validateChoices(): void {
    if (!this.choices || this.choices.length !== 2) {
      throw new InvalidQuizChoicesException('퀴즈는 정확히 2개의 선택지를 가져야 합니다.');
    }

    // 선택지 순서가 0과 1인지 확인
    const orders = this.choices.map((choice) => choice.order).sort();
    if (orders[0] !== 0 || orders[1] !== 1) {
      throw new InvalidQuizOrderException();
    }

    // 선택지 ID가 중복되지 않는지 확인
    const ids = this.choices.map((choice) => choice.id);
    if (new Set(ids).size !== ids.length) {
      throw new DuplicateChoiceIdException();
    }
  }
}
