import { Injectable, Inject } from '@nestjs/common';
import { QuizSet } from '../../domain/quiz-set.entity';
import { QuizSetRepositoryPort } from '../../domain/quiz-set.repository.port';
import { UpdateQuizSetCommand } from '../commands/update-quiz-set.command';

@Injectable()
export class UpdateQuizSetUseCase {
  constructor(@Inject('QuizSetRepositoryPort') private readonly quizSetRepository: QuizSetRepositoryPort) {}

  async execute(command: UpdateQuizSetCommand): Promise<QuizSet> {
    const { id, week, category, title, description, startDate } = command;

    const existingQuizSet = await this.quizSetRepository.findById(id);
    if (!existingQuizSet) {
      throw new Error(`Quiz set with id ${id} not found`);
    }

    // If week or category is changing, check for conflicts
    if ((week && week !== existingQuizSet.week) || 
        (category && category !== existingQuizSet.category)) {
      const newWeek = week ?? existingQuizSet.week;
      const newCategory = category ?? existingQuizSet.category;
      
      const conflictingQuizSet = await this.quizSetRepository.findByWeekAndCategory(newWeek, newCategory);
      if (conflictingQuizSet && conflictingQuizSet.id !== id) {
        throw new Error(`Quiz set for week ${newWeek} and category ${newCategory} already exists`);
      }
    }

    const updatedQuizSet = existingQuizSet.update({
      week,
      category,
      title,
      description,
      startDate,
    });

    return this.quizSetRepository.update(id, updatedQuizSet);
  }
}
