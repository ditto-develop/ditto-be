import { Quiz } from '@module/quiz/domain/entities/quiz.entity';

/**
 * Quiz Repository 인터페이스
 * 도메인 계층에서 사용하는 리포지토리 인터페이스
 */
export interface IQuizRepository {
  /**
   * Quiz 생성
   */
  create(quiz: Quiz): Promise<Quiz>;

  /**
   * ID로 Quiz 조회
   */
  findById(id: string): Promise<Quiz | null>;

  /**
   * QuizSet ID로 모든 Quiz 조회
   */
  findByQuizSetId(quizSetId: string): Promise<Quiz[]>;

  /**
   * Quiz 수정
   */
  update(quiz: Quiz): Promise<Quiz>;

  /**
   * Quiz 삭제
   */
  delete(id: string): Promise<void>;

  /**
   * QuizSet의 최대 순서 조회
   */
  findMaxOrderByQuizSetId(quizSetId: string): Promise<number>;

  /**
   * 여러 퀴즈의 순서를 한 번에 업데이트하고, 포함되지 않은 퀴즈는 삭제
   */
  updateOrders(quizSetId: string, updates: Array<{ id: string; order: number }>): Promise<void>;
}

export const QUIZ_REPOSITORY_TOKEN = Symbol('QuizRepository');
