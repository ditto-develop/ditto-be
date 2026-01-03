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
import { BusinessRuleException } from '@common/exceptions/domain.exception';
import { ReorderQuizzesDto } from '../dto/reorder-quizzes.dto';
import { QuizSet } from '@module/quiz/domain/entities/quiz-set.entity';

@Injectable()
export class ReorderQuizzesUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
  ) {}

  async execute(quizSetId: string, dto: ReorderQuizzesDto): Promise<QuizSet> {
    console.log(`[ReorderQuizzesUseCase] 퀴즈 순서 재정렬 시작: quizSetId=${quizSetId}`);

    // 1. 퀴즈 세트 존재 확인
    const quizSet = await this.quizSetRepository.findById(quizSetId);
    if (!quizSet) {
      throw new QuizSetNotFoundException(quizSetId);
    }

    // 2. 전달받은 퀴즈들이 존재하는지, 그리고 해당 세트에 속해있는지 검증
    const existingQuizzes = await this.quizRepository.findByQuizSetId(quizSetId);
    const existingQuizIds = existingQuizzes.map((q) => q.id);

    for (const quizId of dto.quizIds) {
      if (!existingQuizIds.includes(quizId)) {
        throw new BusinessRuleException(`퀴즈 ID ${quizId}는 이 퀴즈 세트에 속해있지 않거나 존재하지 않습니다.`);
      }
    }

    // 3. 업데이트 데이터 준비 (인덱스 기반 order 할당)
    const updates = dto.quizIds.map((id, index) => ({
      id,
      order: index + 1,
    }));

    // 4. 리포지토리를 통한 일괄 업데이트 및 삭제
    await this.quizRepository.updateOrders(quizSetId, updates);

    console.log(`[ReorderQuizzesUseCase] 퀴즈 순서 재정렬 완료: quizSetId=${quizSetId}`);
    
    // 최종 상태의 퀴즈 세트 반환
    return quizSet;
  }
}

