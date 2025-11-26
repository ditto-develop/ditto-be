import { Injectable, Inject } from '@nestjs/common';
import { QuizSet } from '../../domain/quiz-set.entity';
import { QuizSetRepositoryPort } from '../../domain/quiz-set.repository.port';
import { CreateQuizSetCommand } from '../commands/create-quiz-set.command';

@Injectable()
export class CreateQuizSetUseCase {
  constructor(@Inject('QuizSetRepositoryPort') private readonly quizSetRepository: QuizSetRepositoryPort) {}

  async execute(command: CreateQuizSetCommand): Promise<QuizSet> {
    const { id, week, category, title, description, startDate = new Date() } = command;

    // Check if quiz set with same week and category already exists
    const existingQuizSet = await this.quizSetRepository.findByWeekAndCategory(week, category);
    if (existingQuizSet) {
      throw new Error(`Quiz set for week ${week} and category ${category} already exists`);
    }

    // Calculate end date (7 days after start date)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const quizSet = QuizSet.create({
      id,
      week,
      category,
      title,
      description,
      startDate,
      endDate,
    });

    return this.quizSetRepository.create(quizSet);
  }
}
