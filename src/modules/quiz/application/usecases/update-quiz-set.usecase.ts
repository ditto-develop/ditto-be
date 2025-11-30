import { Inject, Injectable } from '@nestjs/common';
import { UpdateQuizSetDto } from 'src/modules/quiz/application/dto/update-quiz-set.dto';
import { QuizSet } from 'src/modules/quiz/domain/entities/quiz-set.entity';
import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from 'src/modules/quiz/infrastructure/repository/quiz-set.repository.interface';

@Injectable()
export class UpdateQuizSetUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {
    console.log('[UpdateQuizSetUseCase] UpdateQuizSetUseCase 초기화');
  }

  async execute(id: string, dto: UpdateQuizSetDto): Promise<QuizSet> {
    console.log(`[UpdateQuizSetUseCase] QuizSet 수정 시작: id=${id}`);

    // 기존 QuizSet 조회
    const existingQuizSet = await this.quizSetRepository.findById(id);
    if (!existingQuizSet) {
      throw new Error(`퀴즈 세트를 찾을 수 없습니다: ${id}`);
    }

    // 주차가 변경되는 경우, 동일한 주차에 이미 다른 퀴즈 세트가 있는지 확인
    if (dto.week !== undefined && dto.week !== existingQuizSet.week) {
      const quizSetWithSameWeek = await this.quizSetRepository.findByWeek(
        dto.week,
      );
      if (quizSetWithSameWeek && quizSetWithSameWeek.id !== id) {
        throw new Error(`${dto.week}주차에 이미 다른 퀴즈 세트가 존재합니다.`);
      }
    }

    // 시작일이 변경되는 경우, 유효성 검증
    if (dto.startDate !== undefined) {
      const startDate = new Date(dto.startDate);
      const now = new Date();
      if (startDate < now) {
        throw new Error('시작일은 현재 날짜 이후여야 합니다.');
      }
    }

    // 기존 값과 새로운 값을 조합하여 업데이트
    const updatedWeek =
      dto.week !== undefined ? dto.week : existingQuizSet.week;
    const updatedCategory =
      dto.category !== undefined ? dto.category : existingQuizSet.category;
    const updatedTitle =
      dto.title !== undefined ? dto.title : existingQuizSet.title;
    const updatedDescription =
      dto.description !== undefined
        ? dto.description
        : existingQuizSet.description;
    const updatedIsActive =
      dto.isActive !== undefined ? dto.isActive : existingQuizSet.isActive;
    let updatedStartDate = existingQuizSet.startDate;
    let updatedEndDate = existingQuizSet.endDate;

    // 시작일이 변경된 경우, 종료일도 함께 업데이트
    if (dto.startDate !== undefined) {
      updatedStartDate = new Date(dto.startDate);
      // 종료일은 시작일로부터 7일 후로 자동 설정
      updatedEndDate = new Date(updatedStartDate);
      updatedEndDate.setDate(updatedEndDate.getDate() + 7);
    }

    // QuizSet 업데이트
    const updatedQuizSet = existingQuizSet.update(
      updatedWeek,
      updatedCategory,
      updatedTitle,
      updatedDescription,
      updatedStartDate,
      updatedEndDate,
      updatedIsActive,
    );

    const saved = await this.quizSetRepository.update(updatedQuizSet);

    console.log(`[UpdateQuizSetUseCase] QuizSet 수정 완료: id=${saved.id}`);
    return saved;
  }
}
