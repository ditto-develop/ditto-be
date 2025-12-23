import { UpdateQuizSetDto } from '@module/quiz/application/dto/update-quiz-set.dto';
import { QuizSet } from '@module/quiz/domain/entities/quiz-set.entity';
import { QuizSetNotFoundException } from '@module/quiz/domain/exceptions/quiz.exceptions';
import { BusinessRuleException } from '@common/exceptions/domain.exception';
import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { validateForcePassword } from '@module/common/utils/force-password.util';

@Injectable()
export class UpdateQuizSetUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {}

  async execute(id: string, dto: UpdateQuizSetDto, forcePassword?: string): Promise<QuizSet> {
    console.log(`[UpdateQuizSetUseCase] QuizSet 수정 시작: id=${id}`);

    // 기존 QuizSet 조회
    const existingQuizSet = await this.quizSetRepository.findById(id);
    if (!existingQuizSet) {
      throw new QuizSetNotFoundException(id);
    }

    // 강제 적용 패스워드가 유효하면 모든 검증 우회
    const isForced = validateForcePassword(forcePassword);

    // 년, 월, 주차, 카테고리 값 결정 (검증 및 업데이트에서 모두 사용)
    const newYear = dto.year !== undefined ? dto.year : existingQuizSet.year;
    const newMonth = dto.month !== undefined ? dto.month : existingQuizSet.month;
    const newWeek = dto.week !== undefined ? dto.week : existingQuizSet.week;
    const newCategory = dto.category !== undefined ? dto.category : existingQuizSet.category;

    if (!isForced) {
      // 활성화 상태이며 시작일이 오늘 이전인 경우 수정 불가
      const now = new Date();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (existingQuizSet.isActive && existingQuizSet.startDate <= todayEnd) {
        throw new BusinessRuleException('활성화 상태이며 시작일이 오늘 이전인 퀴즈 세트는 수정할 수 없습니다.');
      }

      // 년, 월, 주차, 카테고리가 변경되는 경우, 동일한 위치에 이미 다른 퀴즈 세트가 있는지 확인

      if (
        newYear !== existingQuizSet.year ||
        newMonth !== existingQuizSet.month ||
        newWeek !== existingQuizSet.week ||
        newCategory !== existingQuizSet.category
      ) {
        const quizSetWithSameWeek = await this.quizSetRepository.findByYearMonthWeekCategory(
          newYear,
          newMonth,
          newWeek,
          newCategory,
        );
        if (quizSetWithSameWeek && quizSetWithSameWeek.id !== id) {
          throw new BusinessRuleException(
            `${newYear}년 ${newMonth}월 ${newWeek}주차 ${newCategory} 카테고리에 이미 다른 퀴즈 세트가 존재합니다.`,
          );
        }
      }

      // 시작일이 변경되는 경우, 유효성 검증
      if (dto.startDate !== undefined) {
        const startDate = new Date(dto.startDate);
        if (startDate < now) {
          throw new BusinessRuleException('시작일은 현재 날짜 이후여야 합니다.');
        }
      }
    }

    // 기존 값과 새로운 값을 조합하여 업데이트
    const updatedCategory = dto.category !== undefined ? dto.category : existingQuizSet.category;
    const updatedTitle = dto.title !== undefined ? dto.title : existingQuizSet.title;
    const updatedDescription = dto.description !== undefined ? dto.description : existingQuizSet.description;
    const updatedIsActive = dto.isActive !== undefined ? dto.isActive : existingQuizSet.isActive;
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
      newYear,
      newMonth,
      newWeek,
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
