import { Quiz } from '@module/quiz/domain/entities/quiz.entity';
import {
  IQuizRepository,
  QUIZ_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetQuizzesBySetUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
  ) {}

  async execute(quizSetId: string): Promise<Quiz[]> {
    console.log(`[GetQuizzesBySetUseCase] QuizSet별 Quiz 목록 조회 시작: quizSetId=${quizSetId}`);

    const quizzes = await this.quizRepository.findByQuizSetId(quizSetId);

    console.log(
      `[GetQuizzesBySetUseCase] QuizSet별 Quiz 목록 조회 완료: quizSetId=${quizSetId}, count=${quizzes.length}`,
    );
    return quizzes;
  }
}
