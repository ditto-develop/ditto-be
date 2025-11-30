import { Inject, Injectable } from '@nestjs/common';
import { QuizSet } from 'src/modules/quiz/domain/entities/quiz-set.entity';
import { QuizSetListQueryDto } from 'src/modules/quiz/application/dto/quiz-set-list-query.dto';
import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from 'src/modules/quiz/infrastructure/repository/quiz-set.repository.interface';

@Injectable()
export class GetQuizSetsUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {
    console.log('[GetQuizSetsUseCase] GetQuizSetsUseCase 초기화');
  }

  async execute(query: QuizSetListQueryDto): Promise<QuizSet[]> {
    console.log(
      `[GetQuizSetsUseCase] 퀴즈 세트 목록 조회 시작: query=${JSON.stringify(
        query,
      )}`,
    );

    let quizSets: QuizSet[];

    // 활성화 여부 필터링
    if (query.isActive !== undefined) {
      quizSets = await this.quizSetRepository.findByActiveStatus(
        query.isActive,
      );
    }
    // 주차 필터링
    else if (query.week !== undefined) {
      const quizSet = await this.quizSetRepository.findByWeek(query.week);
      quizSets = quizSet ? [quizSet] : [];
    }
    // 카테고리 필터링
    else if (query.category !== undefined) {
      quizSets = await this.quizSetRepository.findByCategory(query.category);
    }
    // 전체 조회
    else {
      quizSets = await this.quizSetRepository.findAll();
    }

    console.log(
      `[GetQuizSetsUseCase] 퀴즈 세트 목록 조회 완료: count=${quizSets.length}`,
    );
    return quizSets;
  }
}
