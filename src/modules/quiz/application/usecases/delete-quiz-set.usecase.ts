import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { QuizSetNotFoundException } from '@module/quiz/domain/exceptions/quiz.exceptions';
import { BusinessRuleException } from '@common/exceptions/domain.exception';
import { validateForcePassword } from '@module/common/utils/force-password.util';

@Injectable()
export class DeleteQuizSetUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {}

  async execute(id: string, forcePassword?: string): Promise<void> {
    console.log(`[DeleteQuizSetUseCase] QuizSet 삭제 시작: id=${id}`);

    // QuizSet이 존재하는지 확인
    const existingQuizSet = await this.quizSetRepository.findById(id);
    if (!existingQuizSet) {
      throw new QuizSetNotFoundException(id);
    }

    // 강제 적용 패스워드가 유효하면 모든 검증 우회
    const isForced = validateForcePassword(forcePassword);

    if (!isForced) {
      // 활성화 상태이며 시작일이 오늘 이전인 경우 삭제 불가
      const now = new Date();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (existingQuizSet.isActive && existingQuizSet.startDate <= todayEnd) {
        throw new BusinessRuleException('활성화 상태이며 시작일이 오늘 이전인 퀴즈 세트는 삭제할 수 없습니다.');
      }
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
