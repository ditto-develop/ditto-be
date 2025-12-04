import { QuizSet } from '@module/quiz/domain/entities/quiz-set.entity';

/**
 * QuizSet Repository 인터페이스
 * 도메인 계층에서 사용하는 리포지토리 인터페이스
 */
export interface IQuizSetRepository {
  /**
   * QuizSet 생성
   */
  create(quizSet: QuizSet): Promise<QuizSet>;

  /**
   * ID로 QuizSet 조회
   */
  findById(id: string): Promise<QuizSet | null>;

  /**
   * 모든 QuizSet 조회
   */
  findAll(): Promise<QuizSet[]>;

  /**
   * QuizSet 수정
   */
  update(quizSet: QuizSet): Promise<QuizSet>;

  /**
   * QuizSet 삭제
   */
  delete(id: string): Promise<void>;

  /**
   * 주차로 QuizSet 조회
   */
  findByWeek(week: number): Promise<QuizSet | null>;

  /**
   * 카테고리로 QuizSet 목록 조회
   */
  findByCategory(category: string): Promise<QuizSet[]>;

  /**
   * QuizSet에 속한 퀴즈 수 조회
   */
  countQuizzes(quizSetId: string): Promise<number>;

  /**
   * QuizSet 활성화
   */
  activate(id: string): Promise<QuizSet>;

  /**
   * QuizSet 비활성화
   */
  deactivate(id: string): Promise<QuizSet>;

  /**
   * 활성화 상태로 QuizSet 목록 조회
   */
  findByActiveStatus(isActive: boolean): Promise<QuizSet[]>;

  /**
   * 다중 필터로 QuizSet 목록 조회
   */
  findByFilters(week?: number, category?: string, isActive?: boolean): Promise<QuizSet[]>;
}

export const QUIZ_SET_REPOSITORY_TOKEN = Symbol('QuizSetRepository');
