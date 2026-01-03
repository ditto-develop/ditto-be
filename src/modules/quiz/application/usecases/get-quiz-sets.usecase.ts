import { QuizSetListQueryDto } from '@module/quiz/application/dto/quiz-set-list-query.dto';
import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
  QuizSetGroupedResponseDto,
  YearGroupDto,
  MonthGroupDto,
  WeekGroupDto,
} from '../dto/quiz-set-grouped-response.dto';
import { QuizSetDto } from '../dto/quiz-set.dto';
import { WeekCalculator } from '@module/quiz/domain/utils/week-calculator.util';

@Injectable()
export class GetQuizSetsUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {}

  async execute(query: QuizSetListQueryDto): Promise<QuizSetGroupedResponseDto> {
    console.log(`[GetQuizSetsUseCase] 퀴즈 세트 목록 조회 시작: query=${JSON.stringify(query)}`);

    // 1. DB에서 데이터 조회
    const quizSets = await this.quizSetRepository.findByFilters(
      query.year,
      query.month,
      query.week,
      query.category,
      query.isActive,
    );

    // 2. 그룹화 처리
    const yearsMap = new Map<number, YearGroupDto>();

    // 년/월이 지정된 경우, 데이터가 없더라도 해당 월의 모든 주차를 미리 생성
    if (query.year !== undefined && query.month !== undefined) {
      const year = query.year;
      const month = query.month;

      const yearGroup: YearGroupDto = { year, months: [] };
      const monthGroup: MonthGroupDto = { month, weeks: [] };

      const weeksInfo = WeekCalculator.getWeeksInMonth(year, month);
      console.log(
        `[GetQuizSetsUseCase] 생성할 주차 수: ${weeksInfo.length}, 주차: ${weeksInfo.map((w) => w.week).join(', ')}`,
      );

      for (const info of weeksInfo) {
        // 특정 주차 필터가 있는 경우 해당 주차만 포함
        if (query.week !== undefined && info.week !== query.week) continue;

        const weekGroup: WeekGroupDto = {
          week: info.week,
          startDate: info.startDate,
          endDate: info.endDate,
          categories: [],
        };
        monthGroup.weeks.push(weekGroup);
      }

      yearGroup.months.push(monthGroup);
      yearsMap.set(year, yearGroup);
      console.log(`[GetQuizSetsUseCase] 미리 생성된 주차 수: ${monthGroup.weeks.length}`);
    }

    // 조회된 데이터를 계층 구조에 배치
    for (const quizSet of quizSets) {
      let yearGroup = yearsMap.get(quizSet.year);
      if (!yearGroup) {
        yearGroup = { year: quizSet.year, months: [] };
        yearsMap.set(quizSet.year, yearGroup);
      }

      let monthGroup = yearGroup.months.find((m) => m.month === quizSet.month);
      console.log(
        `[GetQuizSetsUseCase] quizSet.year=${quizSet.year}, quizSet.month=${quizSet.month}, 찾은 monthGroup:`,
        monthGroup ? `존재 (주차 수: ${monthGroup.weeks.length})` : '없음',
      );
      if (!monthGroup) {
        monthGroup = { month: quizSet.month, weeks: [] };
        yearGroup.months.push(monthGroup);
      }

      let weekGroup = monthGroup.weeks.find((w) => w.week === quizSet.week);
      if (!weekGroup) {
        // 이미 생성되지 않은 주차라면 (년/월 필터가 없었을 때 등) 생성
        const info = WeekCalculator.getWeekStartDate(quizSet.year, quizSet.month, quizSet.week);
        const endDate = new Date(info.getTime());
        endDate.setDate(info.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        weekGroup = {
          week: quizSet.week,
          startDate: info,
          endDate: endDate,
          categories: [],
        };
        monthGroup.weeks.push(weekGroup);
      }

      let categoryGroup = weekGroup.categories.find((c) => c.category === quizSet.category);
      if (!categoryGroup) {
        categoryGroup = { category: quizSet.category, quizSets: [] };
        weekGroup.categories.push(categoryGroup);
      }

      categoryGroup.quizSets.push(QuizSetDto.fromDomainForList(quizSet));
    }

    // 결과 정렬 및 변환
    const sortedYears = Array.from(yearsMap.values()).sort((a, b) => a.year - b.year);

    for (const yearGroup of sortedYears) {
      yearGroup.months.sort((a, b) => a.month - b.month);
      for (const monthGroup of yearGroup.months) {
        monthGroup.weeks.sort((a, b) => a.week - b.week);
        for (const weekGroup of monthGroup.weeks) {
          weekGroup.categories.sort((a, b) => a.category.localeCompare(b.category));
        }
      }
    }

    console.log(`[GetQuizSetsUseCase] 퀴즈 세트 목록 조회 및 그룹화 완료`);
    console.log(`[GetQuizSetsUseCase] 최종 결과:`, JSON.stringify(sortedYears, null, 2));
    return { years: sortedYears };
  }
}
