import { Inject, Injectable } from '@nestjs/common';
import {
  QUIZ_SET_REPOSITORY_TOKEN,
  IQuizSetRepository,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import {
  QUIZ_REPOSITORY_TOKEN,
  IQuizRepository,
} from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { QuizSetNotFoundException } from '@module/quiz/domain/exceptions/quiz.exceptions';
import { QuizSetDto } from '../dto/quiz-set.dto';
import { QuizDto } from '../dto/quiz.dto';

@Injectable()
export class GetQuizSetUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
  ) {}

  async execute(id: string, includeQuizzes = false): Promise<QuizSetDto & { quizzes?: QuizDto[] }> {
    console.log(`[GetQuizSetUseCase] QuizSet 조회 시작: id=${id}, includeQuizzes=${includeQuizzes}`);

    const quizSet = await this.quizSetRepository.findById(id);

    if (!quizSet) {
      throw new QuizSetNotFoundException(id);
    }

    if (includeQuizzes) {
      const quizzes = await this.quizRepository.findByQuizSetId(id);
      const quizDtos = quizzes.map((quiz) => QuizDto.fromDomain(quiz));

      console.log(`[GetQuizSetUseCase] QuizSet 조회 완료 (퀴즈 포함): id=${id}, quizCount=${quizDtos.length}`);
      return QuizSetDto.fromDomainWithQuizzes(quizSet, quizDtos);
    }

    console.log(`[GetQuizSetUseCase] QuizSet 조회 완료: id=${id}`);
    return QuizSetDto.fromDomain(quizSet);
  }
}

