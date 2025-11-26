import { Choice, CreateChoiceProps, UpdateChoiceProps } from './choice.entity';

export interface ChoiceRepositoryPort {
  findById(id: string): Promise<Choice | null>;
  findByQuizId(quizId: string): Promise<Choice[]>;
  findAll(): Promise<Choice[]>;
  create(props: CreateChoiceProps): Promise<Choice>;
  update(id: string, props: Partial<UpdateChoiceProps>): Promise<Choice>;
  delete(id: string): Promise<void>;
}


