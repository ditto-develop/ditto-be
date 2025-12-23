import { Inject, Injectable } from '@nestjs/common';
import {
  QUIZ_REPOSITORY_TOKEN,
  IQuizRepository,
} from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import {
  QUIZ_ANSWER_REPOSITORY_TOKEN,
  IQuizAnswerRepository,
} from '@module/quiz/infrastructure/repository/quiz-answer.repository.interface';
import {
  QUIZ_SET_REPOSITORY_TOKEN,
  IQuizSetRepository,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { QuizSetNotFoundException } from '@module/quiz/domain/exceptions/quiz.exceptions';
import { QuizWithAnswerDto } from '../dto/quiz-with-answer.dto';
import { QuizDto } from '../dto/quiz.dto';
import { QuizAnswerDto } from '../dto/quiz-answer.dto';

@Injectable()
export class GetQuizSetWithProgressUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
    @Inject(QUIZ_ANSWER_REPOSITORY_TOKEN)
    private readonly quizAnswerRepository: IQuizAnswerRepository,
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {}

  async execute(userId: string, quizSetId: string): Promise<{ quizzes: QuizWithAnswerDto[]; totalCount: number }> {
    const quizSet = await this.quizSetRepository.findById(quizSetId);
    if (!quizSet) {
      throw new QuizSetNotFoundException(quizSetId);
    }

    const quizzes = await this.quizRepository.findByQuizSetId(quizSetId);
    const answers = await this.quizAnswerRepository.findByUserIdAndQuizSetId(userId, quizSetId);

    const quizzesWithAnswers: QuizWithAnswerDto[] = quizzes.map((quiz) => {
      const answer = answers.find((a) => a.quizId === quiz.id);
      const quizDto = QuizDto.fromDomain(quiz);

      return {
        ...quizDto,
        userAnswer: answer ? QuizAnswerDto.fromDomain(answer) : undefined,
      } as QuizWithAnswerDto;
    });

    return {
      quizzes: quizzesWithAnswers,
      totalCount: quizzes.length,
    };
  }
}
