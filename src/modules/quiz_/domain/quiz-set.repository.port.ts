import { QuizSet, CreateQuizSetProps, UpdateQuizSetProps } from './quiz-set.entity';

export interface QuizSetRepositoryPort {
  findById(id: string): Promise<QuizSet | null>;
  findByWeekAndCategory(week: number, category: string): Promise<QuizSet | null>;
  findAll(): Promise<QuizSet[]>;
  create(props: CreateQuizSetProps): Promise<QuizSet>;
  update(id: string, props: Partial<UpdateQuizSetProps>): Promise<QuizSet>;
  delete(id: string): Promise<void>;
}


