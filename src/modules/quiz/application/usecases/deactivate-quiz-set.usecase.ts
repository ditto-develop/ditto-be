import { QuizSet } from '@module/quiz/domain/entities/quiz-set.entity';
import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeactivateQuizSetUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {
    console.log('[DeactivateQuizSetUseCase] DeactivateQuizSetUseCase 초기화');
  }

  async execute(id: string): Promise<QuizSet> {
    console.log(`[DeactivateQuizSetUseCase] QuizSet 비활성화 시작: id=${id}`);

    // QuizSet이 존재하는지 확인
    const quizSet = await this.quizSetRepository.findById(id);
    if (!quizSet) {
      throw new Error(`퀴즈 세트를 찾을 수 없습니다: ${id}`);
    }

    // 이미 비활성화된 경우
    if (!quizSet.isActive) {
      throw new Error(`퀴즈 세트가 이미 비활성화되어 있습니다: ${id}`);
    }

    // QuizSet 비활성화
    const deactivatedQuizSet = quizSet.deactivate();
    const saved = await this.quizSetRepository.update(deactivatedQuizSet);

    console.log(`[DeactivateQuizSetUseCase] QuizSet 비활성화 완료: id=${saved.id}`);
    return saved;
  }
}
