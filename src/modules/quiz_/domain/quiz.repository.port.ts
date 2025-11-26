import { Quiz, CreateQuizProps, UpdateQuizProps } from './quiz.entity';

export interface QuizRepositoryPort {
  findById(id: string): Promise<Quiz | null>;
  findByQuizSetId(quizSetId: string): Promise<Quiz[]>;
  findAll(): Promise<Quiz[]>;
  create(props: CreateQuizProps): Promise<Quiz>;
  update(id: string, props: Partial<UpdateQuizProps>): Promise<Quiz>;
  delete(id: string): Promise<void>;
  swapOrder(quizId1: string, quizId2: string): Promise<void>;
}


