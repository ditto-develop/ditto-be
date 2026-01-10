import { CreateQuizSetDto } from '@module/quiz/application/dto/create-quiz-set.dto';
import { QuizSet } from '@module/quiz/domain/entities/quiz-set.entity';
import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException } from '@common/exceptions/domain.exception';
import { v4 as uuidv4 } from 'uuid';
import { validateForcePassword } from '@module/common/utils/force-password.util';
import { WeekCalculator } from '@module/quiz/domain/utils/week-calculator.util';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class CreateQuizSetUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {
    this.logger.log('CreateQuizSetUseCase 초기화', 'CreateQuizSetUseCase');
  }

  async execute(dto: CreateQuizSetDto, forcePassword?: string): Promise<QuizSet> {
    this.logger.log('QuizSet 생성 시작', 'CreateQuizSetUseCase', {
      title: dto.title,
      year: dto.year,
      month: dto.month,
      week: dto.week,
      category: dto.category,
      isForced: validateForcePassword(forcePassword),
    });

    // 주차 기반 시작일 계산
    const startDate = WeekCalculator.getWeekStartDate(dto.year, dto.month, dto.week);

    // 강제 적용 패스워드가 유효하면 모든 검증 우회
    const isForced = validateForcePassword(forcePassword);

    if (!isForced) {
      // 계산된 시작일이 현재 날짜 이후인지 확인
      const now = new Date();
      if (startDate < now) {
        this.logger.warn('QuizSet 생성 실패: 시작일이 과거임', 'CreateQuizSetUseCase', {
          title: dto.title,
          year: dto.year,
          month: dto.month,
          week: dto.week,
          startDate,
          currentDate: now,
        });
        throw new BusinessRuleException('해당 주차의 시작일(월요일)은 현재 날짜 이후여야 합니다.');
      }

      // 동일한 년, 월, 주차, 카테고리에 이미 퀴즈 세트가 있는지 확인
      const existingQuizSet = await this.quizSetRepository.findByYearMonthWeekCategory(
        dto.year,
        dto.month,
        dto.week,
        dto.category,
      );
      if (existingQuizSet) {
        this.logger.warn('QuizSet 생성 실패: 중복 퀴즈 세트', 'CreateQuizSetUseCase', {
          title: dto.title,
          year: dto.year,
          month: dto.month,
          week: dto.week,
          category: dto.category,
          existingQuizSetId: existingQuizSet.id,
        });
        throw new BusinessRuleException(
          `${dto.year}년 ${dto.month}월 ${dto.week}주차 ${dto.category} 카테고리에 이미 퀴즈 세트가 존재합니다.`,
        );
      }
    }

    // ID 생성
    const id = uuidv4();

    // QuizSet 생성 (endDate는 startDate로부터 7일 후로 자동 설정)
    const quizSet = QuizSet.createWithEndDate(
      id,
      dto.year,
      dto.month,
      dto.week,
      dto.category,
      dto.title,
      dto.description || null,
      startDate,
    );

    const created = await this.quizSetRepository.create(quizSet);

    this.logger.log('QuizSet 생성 완료', 'CreateQuizSetUseCase', {
      quizSetId: created.id,
      title: created.title,
      year: created.year,
      month: created.month,
      week: created.week,
      category: created.category,
    });

    return created;
  }
}
