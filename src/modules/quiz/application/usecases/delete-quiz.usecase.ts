import { QuizNotFoundException } from '@module/quiz/domain/exceptions/quiz.exceptions';
import {
  IQuizRepository,
  QUIZ_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
  ) {}

  async execute(quizId: string): Promise<void> {
    console.log(`[DeleteQuizUseCase] Quiz 삭제 시작: quizId=${quizId}`);

    // 퀴즈가 존재하는지 먼저 확인
    const existingQuiz = await this.quizRepository.findById(quizId);
    if (!existingQuiz) {
      throw new QuizNotFoundException(quizId);
    }

    // 퀴즈 삭제 (Cascade로 Choice도 함께 삭제됨)
    await this.quizRepository.delete(quizId);

    console.log(`[DeleteQuizUseCase] Quiz 삭제 완료: quizId=${quizId}`);
  }
}
