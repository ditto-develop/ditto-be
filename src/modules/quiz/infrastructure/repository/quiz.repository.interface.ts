import { Quiz } from 'src/modules/quiz/domain/entities/quiz.entity';

/**
 * Quiz Repository 인터페이스
 * 도메인 계층에서 사용하는 리포지토리 인터페이스
 */
export interface IQuizRepository {
  /**
   * Quiz 생성
   */
  create(quiz: Quiz): Promise<Quiz>;
}

export const QUIZ_REPOSITORY_TOKEN = Symbol('QuizRepository');
