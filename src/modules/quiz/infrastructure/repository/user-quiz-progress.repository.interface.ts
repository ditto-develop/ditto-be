import { UserQuizProgress } from '@module/quiz/domain/entities/user-quiz-progress.entity';

export interface IUserQuizProgressRepository {
  findByUserIdAndYearMonthWeek(
    userId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<UserQuizProgress | null>;
  findByUserIdAndWeek(userId: string, week: number): Promise<UserQuizProgress | null>;
  create(progress: UserQuizProgress): Promise<UserQuizProgress>;
  update(progress: UserQuizProgress): Promise<UserQuizProgress>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string): Promise<UserQuizProgress[]>;
  findCompletedUsersByQuizSetId(quizSetId: string, year: number, month: number, week: number): Promise<string[]>;
  countCompletedByYearMonthWeek(year: number, month: number, week: number): Promise<number>;
}

export const USER_QUIZ_PROGRESS_REPOSITORY_TOKEN = Symbol('IUserQuizProgressRepository');
