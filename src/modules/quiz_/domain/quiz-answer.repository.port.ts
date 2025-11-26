import { QuizAnswer, CreateQuizAnswerProps } from './quiz-answer.entity';

export interface QuizAnswerRepositoryPort {
  findById(id: string): Promise<QuizAnswer | null>;
  findByUserId(userId: string): Promise<QuizAnswer[]>;
  findByQuizId(quizId: string): Promise<QuizAnswer[]>;
  findAll(): Promise<QuizAnswer[]>;
  create(props: CreateQuizAnswerProps): Promise<QuizAnswer>;
  delete(id: string): Promise<void>;
}


