import { Injectable, Inject } from '@nestjs/common';
import { Quiz } from './quiz.entity';
import { QuizRepositoryPort } from './quiz.repository.port';

@Injectable()
export class QuizDomainService {
  constructor(@Inject('QuizRepositoryPort') private readonly quizRepository: QuizRepositoryPort) {}

  async validateQuizOrder(quizSetId: string, order: number): Promise<boolean> {
    const existingQuiz = await this.quizRepository.findByQuizSetId(quizSetId);
    return !existingQuiz.some(quiz => quiz.order === order);
  }

  async getMaxOrder(quizSetId: string): Promise<number> {
    const quizzes = await this.quizRepository.findByQuizSetId(quizSetId);
    if (quizzes.length === 0) return 0;
    
    return Math.max(...quizzes.map(quiz => quiz.order));
  }

  async swapQuizOrder(quizId1: string, quizId2: string): Promise<void> {
    const quiz1 = await this.quizRepository.findById(quizId1);
    const quiz2 = await this.quizRepository.findById(quizId2);

    if (!quiz1 || !quiz2) {
      throw new Error('One or both quizzes not found');
    }

    if (quiz1.quizSetId !== quiz2.quizSetId) {
      throw new Error('Quizzes must belong to the same quiz set');
    }

    await this.quizRepository.swapOrder(quizId1, quizId2);
  }
}
