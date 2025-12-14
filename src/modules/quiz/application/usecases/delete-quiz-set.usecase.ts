import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { QuizSetNotFoundException } from '@module/quiz/domain/exceptions/quiz.exceptions';
import { BusinessRuleException } from '@common/exceptions/domain.exception';

@Injectable()
export class DeleteQuizSetUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {}

  async execute(id: string): Promise<void> {
    console.log(`[DeleteQuizSetUseCase] QuizSet 삭제 시작: id=${id}`);

    // QuizSet이 존재하는지 확인
    const existingQuizSet = await this.quizSetRepository.findById(id);
    if (!existingQuizSet) {
      throw new QuizSetNotFoundException(id);
    }

    // QuizSet에 속한 퀴즈가 있는지 확인
    const quizCount = await this.quizSetRepository.countQuizzes(id);
    if (quizCount > 0) {
      throw new BusinessRuleException(
        `퀴즈 세트에 ${quizCount}개의 퀴즈가 있어 삭제할 수 없습니다. 먼저 모든 퀴즈를 삭제해주세요.`,
      );
    }

    // QuizSet 삭제
    await this.quizSetRepository.delete(id);

    console.log(`[DeleteQuizSetUseCase] QuizSet 삭제 완료: id=${id}`);
  }
}
