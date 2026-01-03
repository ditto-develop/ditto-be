import { Quiz } from '../entities/quiz.entity';
import { QuizChoice } from '../value-objects/quiz-choice.vo';
import { InvalidQuizChoicesException } from '../exceptions/quiz.exceptions';

/**
 * 퀴즈 생성 팩토리 클래스
 * 퀴즈와 선택지 생성 로직을 캡슐화하고 비즈니스 규칙을 검증합니다.
 */
export class QuizFactory {
  /**
   * 퀴즈 생성
   */
  static create(
    id: string,
    question: string,
    choiceContents: [string, string], // 선택지 내용 2개
    order: number,
    quizSetId: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ): Quiz {
    // 선택지 내용 검증
    this.validateChoiceContents(choiceContents);

    // QuizChoice 인스턴스 생성
    const choices: [QuizChoice, QuizChoice] = [
      QuizChoice.create(`${id}-choice-1`, choiceContents[0], 1),
      QuizChoice.create(`${id}-choice-2`, choiceContents[1], 2),
    ];

    return Quiz.create(id, question, choices, order, quizSetId, createdAt, updatedAt);
  }

  /**
   * 기존 퀴즈 수정 시 새로운 Quiz 인스턴스 생성
   */
  static createUpdated(existingQuiz: Quiz, question?: string, choiceContents?: [string, string], order?: number): Quiz {
    const newQuestion = question ?? existingQuiz.question;
    const newOrder = order ?? existingQuiz.order;

    let newChoices = existingQuiz.choices;

    if (choiceContents) {
      // 선택지 내용 검증
      this.validateChoiceContents(choiceContents);

      // 새로운 QuizChoice 인스턴스 생성 (ID 유지)
      newChoices = [
        QuizChoice.create(existingQuiz.choices[0].id, choiceContents[0], 1),
        QuizChoice.create(existingQuiz.choices[1].id, choiceContents[1], 2),
      ];
    }

    return Quiz.create(
      existingQuiz.id,
      newQuestion,
      newChoices,
      newOrder,
      existingQuiz.quizSetId,
      existingQuiz.createdAt,
      new Date(),
    );
  }

  /**
   * 선택지 내용 검증
   */
  private static validateChoiceContents(contents: [string, string]): void {
    if (!contents || contents.length !== 2) {
      throw new InvalidQuizChoicesException('선택지는 정확히 2개여야 합니다.');
    }

    if (!contents[0] || contents[0].trim() === '' || !contents[1] || contents[1].trim() === '') {
      throw new InvalidQuizChoicesException('선택지 내용은 비어있을 수 없습니다.');
    }

    if (contents[0].trim() === contents[1].trim()) {
      throw new InvalidQuizChoicesException('두 선택지의 내용이 동일할 수 없습니다.');
    }

    // 각 선택지 길이 검증
    contents.forEach((content, index) => {
      if (content.length > 500) {
        throw new InvalidQuizChoicesException(`${index + 1}번 선택지가 500자를 초과합니다.`);
      }
    });
  }

  /**
   * 데이터베이스로부터 조회된 데이터를 도메인 객체로 변환
   */
  static fromPersistence(quizData: {
    id: string;
    question: string;
    order: number;
    quizSetId: string;
    createdAt: Date;
    updatedAt: Date;
    choices: Array<{
      id: string;
      text: string;
      order: number;
    }>;
  }): Quiz {
    const choices: [QuizChoice, QuizChoice] = [
      QuizChoice.create(quizData.choices[0].id, quizData.choices[0].text, quizData.choices[0].order),
      QuizChoice.create(quizData.choices[1].id, quizData.choices[1].text, quizData.choices[1].order),
    ];

    return Quiz.create(
      quizData.id,
      quizData.question,
      choices,
      quizData.order,
      quizData.quizSetId,
      quizData.createdAt,
      quizData.updatedAt,
    );
  }
}
