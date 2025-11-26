import { Injectable, Inject } from '@nestjs/common';
import { QuizSetRepositoryPort } from '../../domain/quiz-set.repository.port';
import { DeleteQuizSetCommand } from '../commands/delete-quiz-set.command';

@Injectable()
export class DeleteQuizSetUseCase {
  constructor(@Inject('QuizSetRepositoryPort') private readonly quizSetRepository: QuizSetRepositoryPort) {}

  async execute(command: DeleteQuizSetCommand): Promise<void> {
    const { id } = command;

    const existingQuizSet = await this.quizSetRepository.findById(id);
    if (!existingQuizSet) {
      throw new Error(`Quiz set with id ${id} not found`);
    }

    await this.quizSetRepository.delete(id);
  }
}
