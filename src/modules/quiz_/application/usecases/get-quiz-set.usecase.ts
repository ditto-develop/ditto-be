import { Injectable, Inject } from '@nestjs/common';
import { QuizSet } from '../../domain/quiz-set.entity';
import { QuizSetRepositoryPort } from '../../domain/quiz-set.repository.port';
import { 
  GetQuizSetQuery, 
  GetQuizSetsByWeekAndCategoryQuery, 
  GetAllQuizSetsQuery 
} from '../queries/get-quiz-set.query';

@Injectable()
export class GetQuizSetUseCase {
  constructor(@Inject('QuizSetRepositoryPort') private readonly quizSetRepository: QuizSetRepositoryPort) {}

  async getById(query: GetQuizSetQuery): Promise<QuizSet | null> {
    return this.quizSetRepository.findById(query.id);
  }

  async getByWeekAndCategory(query: GetQuizSetsByWeekAndCategoryQuery): Promise<QuizSet | null> {
    return this.quizSetRepository.findByWeekAndCategory(query.week, query.category);
  }

  async getAll(query: GetAllQuizSetsQuery): Promise<QuizSet[]> {
    return this.quizSetRepository.findAll();
  }
}
