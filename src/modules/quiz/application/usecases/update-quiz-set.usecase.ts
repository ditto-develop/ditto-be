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
import { WeekCalculator } from '@module/quiz/domain/utils/week-calculator.util';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class UpdateQuizSetUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {
    this.logger.log('UpdateQuizSetUseCase 초기화', 'UpdateQuizSetUseCase');
  }

  async execute(id: string, dto: UpdateQuizSetDto, forcePassword?: string): Promise<QuizSet> {
    this.logger.log('QuizSet 수정 시작', 'UpdateQuizSetUseCase', {
      quizSetId: id,
      updates: dto,
      isForced: validateForcePassword(forcePassword),
    });

    // 기존 QuizSet 조회
    const existingQuizSet = await this.quizSetRepository.findById(id);
    if (!existingQuizSet) {
      this.logger.warn('QuizSet 수정 실패: 퀴즈 세트를 찾을 수 없음', 'UpdateQuizSetUseCase', { quizSetId: id });
      throw new QuizSetNotFoundException(id);
    }

    // 강제 적용 패스워드가 유효하면 모든 검증 우회
    const isForced = validateForcePassword(forcePassword);

    // 년, 월, 주차, 카테고리 값 결정 (검증 및 업데이트에서 모두 사용)
    const newYear = dto.year !== undefined ? dto.year : existingQuizSet.year;
    const newMonth = dto.month !== undefined ? dto.month : existingQuizSet.month;
    const newWeek = dto.week !== undefined ? dto.week : existingQuizSet.week;
    const newCategory = dto.category !== undefined ? dto.category : existingQuizSet.category;

    // 주차 정보 변경 여부 확인
    const isWeekInfoChanged =
      newYear !== existingQuizSet.year || newMonth !== existingQuizSet.month || newWeek !== existingQuizSet.week;

    let updatedStartDate = existingQuizSet.startDate;
    let updatedEndDate = existingQuizSet.endDate;

    // 주차 정보가 변경된 경우 시작일과 종료일 재계산
    if (isWeekInfoChanged) {
      updatedStartDate = WeekCalculator.getWeekStartDate(newYear, newMonth, newWeek);
      updatedEndDate = new Date(updatedStartDate);
      updatedEndDate.setDate(updatedEndDate.getDate() + 7);
    }

    if (!isForced) {
      // 활성화 상태이며 시작일이 오늘 이전인 경우 수정 불가
      const now = new Date();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (existingQuizSet.isActive && existingQuizSet.startDate <= todayEnd) {
        this.logger.warn('QuizSet 수정 실패: 활성 상태의 과거 퀴즈 세트', 'UpdateQuizSetUseCase', {
          quizSetId: id,
          isActive: existingQuizSet.isActive,
          startDate: existingQuizSet.startDate,
        });
        throw new BusinessRuleException('활성화 상태이며 시작일이 오늘 이전인 퀴즈 세트는 수정할 수 없습니다.');
      }

      // 주차가 변경된 경우, 새로운 주차 시작일이 현재 날짜 이후인지 확인
      if (isWeekInfoChanged && updatedStartDate < now) {
        this.logger.warn('QuizSet 수정 실패: 새로운 시작일이 과거임', 'UpdateQuizSetUseCase', {
          quizSetId: id,
          newStartDate: updatedStartDate,
          currentDate: now,
        });
        throw new BusinessRuleException('해당 주차의 시작일(월요일)은 현재 날짜 이후여야 합니다.');
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
          this.logger.warn('QuizSet 수정 실패: 동일 주차에 다른 퀴즈 세트 존재', 'UpdateQuizSetUseCase', {
            quizSetId: id,
            year: newYear,
            month: newMonth,
            week: newWeek,
            category: newCategory,
            conflictingQuizSetId: quizSetWithSameWeek.id,
          });
          throw new BusinessRuleException(
            `${newYear}년 ${newMonth}월 ${newWeek}주차 ${newCategory} 카테고리에 이미 다른 퀴즈 세트가 존재합니다.`,
          );
        }
      }
    }

    // 기존 값과 새로운 값을 조합하여 업데이트
    const updatedCategory = dto.category !== undefined ? dto.category : existingQuizSet.category;
    const updatedTitle = dto.title !== undefined ? dto.title : existingQuizSet.title;
    const updatedDescription = dto.description !== undefined ? dto.description : existingQuizSet.description;
    const updatedIsActive = dto.isActive !== undefined ? dto.isActive : existingQuizSet.isActive;

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

    this.logger.log('QuizSet 수정 완료', 'UpdateQuizSetUseCase', {
      quizSetId: saved.id,
      title: saved.title,
      year: saved.year,
      month: saved.month,
      week: saved.week,
      category: saved.category,
      isActive: saved.isActive,
      changes: {
        isWeekInfoChanged,
        categoryChanged: dto.category !== undefined,
        titleChanged: dto.title !== undefined,
        descriptionChanged: dto.description !== undefined,
        isActiveChanged: dto.isActive !== undefined,
      },
    });

    return saved;
  }
}
