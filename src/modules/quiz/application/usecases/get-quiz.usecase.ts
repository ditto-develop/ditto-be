import { Quiz } from '@module/quiz/domain/entities/quiz.entity';
import { QuizNotFoundException } from '@module/quiz/domain/exceptions/quiz.exceptions';
import {
  IQuizRepository,
  QUIZ_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
  ) {}

  async execute(quizId: string): Promise<Quiz> {
    console.log(`[GetQuizUseCase] Quiz 조회 시작: quizId=${quizId}`);

    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new QuizNotFoundException(quizId);
    }

    console.log(`[GetQuizUseCase] Quiz 조회 완료: quizId=${quizId}`);
    return quiz;
  }
}
