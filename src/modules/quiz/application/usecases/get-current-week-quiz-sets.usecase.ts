import { Inject, Injectable } from '@nestjs/common';
import {
  QUIZ_SET_REPOSITORY_TOKEN,
  IQuizSetRepository,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import {
  QUIZ_REPOSITORY_TOKEN,
  IQuizRepository,
} from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { CurrentWeekQuizSetsResponseDto } from '../dto/current-week-quiz-sets-response.dto';
import { CurrentWeekQuizSetDto } from '../dto/current-week-quiz-set.dto';
import { QuizDto } from '../dto/quiz.dto';
import { QuizSetDto } from '../dto/quiz-set.dto';

@Injectable()
export class GetCurrentWeekQuizSetsUseCase {
  constructor(
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
    private readonly systemStateService: SystemStateService,
  ) {}

  async execute(): Promise<CurrentWeekQuizSetsResponseDto> {
    console.log('[GetCurrentWeekQuizSetsUseCase] 이번 주차 퀴즈 세트 조회 시작');

    // 현재 년, 월, 주차 조회
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    console.log(`[GetCurrentWeekQuizSetsUseCase] 현재 주차: ${year}년 ${month}월 ${week}주차`);

    // 현재 주차의 모든 퀴즈 세트 조회 (활성화된 것만 조회할지 고민되지만, 일단 필터 없이 조회)
    const quizSets = await this.quizSetRepository.findByFilters(year, month, week);

    console.log(`[GetCurrentWeekQuizSetsUseCase] 조회된 퀴즈 세트 수: ${quizSets.length}`);

    // 각 퀴즈 세트에 퀴즈 목록 추가 (병렬 처리)
    const quizSetsWithQuizzes: CurrentWeekQuizSetDto[] = await Promise.all(
      quizSets.map(async (quizSet) => {
        // 퀴즈 목록 조회 (이미 order로 정렬됨)
        const quizzes = await this.quizRepository.findByQuizSetId(quizSet.id);
        const quizDtos = quizzes.map((quiz) => QuizDto.fromDomain(quiz));

        // DTO 변환 (타임스탬프 제외)
        const dto = QuizSetDto.fromDomainWithQuizzes(quizSet, quizDtos, true);
        return dto as CurrentWeekQuizSetDto;
      }),
    );

    // 카테고리별로 정렬
    quizSetsWithQuizzes.sort((a, b) => a.category.localeCompare(b.category));

    console.log('[GetCurrentWeekQuizSetsUseCase] 이번 주차 퀴즈 세트 조회 완료');

    return {
      year,
      month,
      week,
      quizSets: quizSetsWithQuizzes,
    };
  }
}

