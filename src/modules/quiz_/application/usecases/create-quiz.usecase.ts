import { Injectable, Inject } from '@nestjs/common';
import { Quiz } from '../../domain/quiz.entity';
import { QuizRepositoryPort } from '../../domain/quiz.repository.port';
import { QuizSetRepositoryPort } from '../../domain/quiz-set.repository.port';
import { QuizDomainService } from '../../domain/quiz.domain.service';
import { CreateQuizCommand } from '../commands/create-quiz.command';

@Injectable()
export class CreateQuizUseCase {
  constructor(
    @Inject('QuizRepositoryPort') private readonly quizRepository: QuizRepositoryPort,
    @Inject('QuizSetRepositoryPort') private readonly quizSetRepository: QuizSetRepositoryPort,
    private readonly quizDomainService: QuizDomainService,
  ) {}

  async execute(command: CreateQuizCommand): Promise<Quiz> {
    const { id, question, quizSetId, order } = command;

    // Check if quiz set exists
    const quizSet = await this.quizSetRepository.findById(quizSetId);
    if (!quizSet) {
      throw new Error(`Quiz set with id ${quizSetId} not found`);
    }

    // Check if quiz set already has 12 quizzes
    const existingQuizzes = await this.quizRepository.findByQuizSetId(quizSetId);
    if (existingQuizzes.length >= 12) {
      throw new Error(`Quiz set already has maximum 12 quizzes`);
    }

    // Determine order if not provided
    let quizOrder = order;
    if (quizOrder === undefined) {
      quizOrder = await this.quizDomainService.getMaxOrder(quizSetId) + 1;
    } else {
      // Validate order if provided
      const isOrderValid = await this.quizDomainService.validateQuizOrder(quizSetId, quizOrder);
      if (!isOrderValid) {
        throw new Error(`Quiz with order ${quizOrder} already exists in this quiz set`);
      }
    }

    const quiz = Quiz.create({
      id,
      question,
      quizSetId,
      order: quizOrder,
    });

    return this.quizRepository.create(quiz);
  }
}
