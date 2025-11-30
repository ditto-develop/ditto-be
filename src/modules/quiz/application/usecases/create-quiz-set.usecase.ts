import { Inject, Injectable } from '@nestjs/common';
import { CreateQuizSetDto } from 'src/modules/quiz/application/dto/create-quiz-set.dto';
import { QuizSet } from 'src/modules/quiz/domain/entities/quiz-set.entity';
import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from 'src/modules/quiz/infrastructure/repository/quiz-set.repository.interface';

@Injectable()
export class CreateQuizSetUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {
    console.log('[CreateQuizSetUseCase] CreateQuizSetUseCase 초기화');
  }

  async execute(dto: CreateQuizSetDto): Promise<QuizSet> {
    console.log(`[CreateQuizSetUseCase] QuizSet 생성 시작: title=${dto.title}`);

    // 시작일이 현재 날짜 이후인지 확인
    const startDate = new Date(dto.startDate);
    const now = new Date();
    if (startDate < now) {
      throw new Error('시작일은 현재 날짜 이후여야 합니다.');
    }

    // 동일한 주차에 이미 퀴즈 세트가 있는지 확인
    const existingQuizSet = await this.quizSetRepository.findByWeek(dto.week);
    if (existingQuizSet) {
      throw new Error(`${dto.week}주차에 이미 퀴즈 세트가 존재합니다.`);
    }

    // ID 생성 (실제로는 cuid 라이브러리 사용)
    const id = `quiz-set-${Date.now()}`;

    // QuizSet 생성 (endDate는 startDate로부터 7일 후로 자동 설정)
    const quizSet = QuizSet.createWithEndDate(
      id,
      dto.week,
      dto.category,
      dto.title,
      dto.description || null,
      startDate,
    );

    const created = await this.quizSetRepository.create(quizSet);

    console.log(`[CreateQuizSetUseCase] QuizSet 생성 완료: id=${created.id}`);
    return created;
  }
}
