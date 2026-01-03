import { QuizAnswer } from '@module/quiz/domain/entities/quiz-answer.entity';

export interface IQuizAnswerRepository {
  create(answer: QuizAnswer): Promise<QuizAnswer>;
  update(answer: QuizAnswer): Promise<QuizAnswer>;
  findById(id: string): Promise<QuizAnswer | null>;
  findByUserIdAndQuizId(userId: string, quizId: string): Promise<QuizAnswer | null>;
  findByUserIdAndQuizSetId(userId: string, quizSetId: string): Promise<QuizAnswer[]>;
  deleteByUserIdAndYearMonthWeek(userId: string, year: number, month: number, week: number): Promise<void>;
  deleteByUserIdAndWeek(userId: string, week: number): Promise<void>;
  countByQuizSetId(quizSetId: string): Promise<number>;
}

export const QUIZ_ANSWER_REPOSITORY_TOKEN = Symbol('IQuizAnswerRepository');
