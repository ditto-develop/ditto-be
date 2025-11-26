import { Injectable, Inject } from '@nestjs/common';
import { QuizAnswer } from '../../domain/quiz-answer.entity';
import { QuizAnswerRepositoryPort } from '../../domain/quiz-answer.repository.port';
import { QuizRepositoryPort } from '../../domain/quiz.repository.port';
import { QuizSetRepositoryPort } from '../../domain/quiz-set.repository.port';
import { SubmitQuizAnswerCommand } from '../commands/submit-quiz-answer.command';

@Injectable()
export class SubmitQuizAnswerUseCase {
  constructor(
    @Inject('QuizAnswerRepositoryPort') private readonly quizAnswerRepository: QuizAnswerRepositoryPort,
    @Inject('QuizRepositoryPort') private readonly quizRepository: QuizRepositoryPort,
    @Inject('QuizSetRepositoryPort') private readonly quizSetRepository: QuizSetRepositoryPort,
  ) {}

  async execute(command: SubmitQuizAnswerCommand): Promise<QuizAnswer> {
    const { id, userId, quizId, choiceId } = command;

    // Check if quiz exists
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new Error(`Quiz with id ${quizId} not found`);
    }

    // Check if quiz set is active
    const quizSet = await this.quizSetRepository.findById(quiz.quizSetId);
    if (!quizSet) {
      throw new Error(`Quiz set with id ${quiz.quizSetId} not found`);
    }

    if (!quizSet.isActive()) {
      throw new Error(`Quiz set is not active`);
    }

    // Check if user has already answered this quiz
    const existingAnswers = await this.quizAnswerRepository.findByQuizId(quizId);
    const userAnswer = existingAnswers.find(answer => answer.userId === userId);
    if (userAnswer) {
      throw new Error(`User has already answered this quiz`);
    }

    const quizAnswer = QuizAnswer.create({
      id,
      userId,
      quizId,
      choiceId,
    });

    return this.quizAnswerRepository.create(quizAnswer);
  }
}
