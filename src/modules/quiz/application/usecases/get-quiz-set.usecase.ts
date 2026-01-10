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
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetQuizSetUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {
    this.logger.log('GetQuizSetUseCase 초기화', 'GetQuizSetUseCase');
  }

  async execute(id: string, includeQuizzes = false): Promise<QuizSetDto & { quizzes?: QuizDto[] }> {
    this.logger.log('QuizSet 조회 시작', 'GetQuizSetUseCase', {
      quizSetId: id,
      includeQuizzes,
    });

    const quizSet = await this.quizSetRepository.findById(id);

    if (!quizSet) {
      this.logger.warn('QuizSet 조회 실패: 퀴즈 세트를 찾을 수 없음', 'GetQuizSetUseCase', { quizSetId: id });
      throw new QuizSetNotFoundException(id);
    }

    if (includeQuizzes) {
      const quizzes = await this.quizRepository.findByQuizSetId(id);
      const quizDtos = quizzes.map((quiz) => QuizDto.fromDomain(quiz));

      this.logger.log('QuizSet 조회 완료 (퀴즈 포함)', 'GetQuizSetUseCase', {
        quizSetId: id,
        quizCount: quizDtos.length,
        title: quizSet.title,
        year: quizSet.year,
        month: quizSet.month,
        week: quizSet.week,
        category: quizSet.category,
      });

      return QuizSetDto.fromDomainWithQuizzes(quizSet, quizDtos);
    }

    this.logger.log('QuizSet 조회 완료', 'GetQuizSetUseCase', {
      quizSetId: id,
      title: quizSet.title,
      year: quizSet.year,
      month: quizSet.month,
      week: quizSet.week,
      category: quizSet.category,
    });

    return QuizSetDto.fromDomain(quizSet);
  }
}

