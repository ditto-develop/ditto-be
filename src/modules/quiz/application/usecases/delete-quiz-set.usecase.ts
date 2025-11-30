import { Inject, Injectable } from '@nestjs/common';
import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from 'src/modules/quiz/infrastructure/repository/quiz-set.repository.interface';

@Injectable()
export class DeleteQuizSetUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {
    console.log('[DeleteQuizSetUseCase] DeleteQuizSetUseCase 초기화');
  }

  async execute(id: string): Promise<void> {
    console.log(`[DeleteQuizSetUseCase] QuizSet 삭제 시작: id=${id}`);

    // QuizSet이 존재하는지 확인
    const existingQuizSet = await this.quizSetRepository.findById(id);
    if (!existingQuizSet) {
      throw new Error(`퀴즈 세트를 찾을 수 없습니다: ${id}`);
    }

    // QuizSet에 속한 퀴즈가 있는지 확인
    const quizCount = await this.quizSetRepository.countQuizzes(id);
    if (quizCount > 0) {
      throw new Error(
        `퀴즈 세트에 ${quizCount}개의 퀴즈가 있어 삭제할 수 없습니다. 먼저 모든 퀴즈를 삭제해주세요.`,
      );
    }

    // QuizSet 삭제
    await this.quizSetRepository.delete(id);

    console.log(`[DeleteQuizSetUseCase] QuizSet 삭제 완료: id=${id}`);
  }
}
