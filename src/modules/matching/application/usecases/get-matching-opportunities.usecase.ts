import { Injectable, Inject } from '@nestjs/common';
import { IMatchingOpportunityRepository, MATCHING_OPPORTUNITY_REPOSITORY_TOKEN } from '@module/matching/infrastructure/repository/matching-opportunity.repository.interface';
import { MatchingOpportunityWithRelations } from '@module/matching/infrastructure/repository/matching-opportunity.repository';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { IUserQuizProgressRepository, USER_QUIZ_PROGRESS_REPOSITORY_TOKEN } from '@module/quiz/infrastructure/repository/user-quiz-progress.repository.interface';

export interface MatchingOpportunityWithUser {
  id: string;
  matchedUserId: string;
  matchedUser: {
    id: string;
    nickname: string;
    gender: string;
  };
  quizSetId: string;
  matchScore: number;
  createdAt: Date;
}

@Injectable()
export class GetMatchingOpportunitiesUseCase {
  constructor(
    @Inject(MATCHING_OPPORTUNITY_REPOSITORY_TOKEN)
    private readonly matchingOpportunityRepository: IMatchingOpportunityRepository,
    @Inject(USER_QUIZ_PROGRESS_REPOSITORY_TOKEN)
    private readonly userQuizProgressRepository: IUserQuizProgressRepository,
    private readonly systemStateService: SystemStateService,
  ) {}

  async execute(userId: string): Promise<MatchingOpportunityWithUser[]> {
    // 현재 주차 정보 조회
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    // 사용자가 이번 주차에 푼 퀴즈 세트 조회
    const progress = await this.userQuizProgressRepository.findByUserIdAndYearMonthWeek(
      userId,
      year,
      month,
      week,
    );

    // 퀴즈를 풀지 않은 경우 빈 배열 반환
    if (!progress) {
      return [];
    }

    // 현재 주차의 매칭 기회 조회
    const opportunities = await this.matchingOpportunityRepository.findByUserIdAndYearMonthWeekWithRelations(
      userId,
      year,
      month,
      week,
    );

    // 사용자가 푼 퀴즈 세트의 기회만 필터링
    const filteredOpportunities = opportunities.filter(opp => opp.quizSetId === progress.quizSetId);

    // 사용자 정보와 함께 변환
    return filteredOpportunities.map((opp: MatchingOpportunityWithRelations): MatchingOpportunityWithUser => ({
      id: opp.id,
      matchedUserId: opp.matchedUserId,
      matchedUser: opp.matchedUser ? {
        id: opp.matchedUser.id,
        nickname: opp.matchedUser.nickname,
        gender: opp.matchedUser.gender,
      } : {
        id: opp.matchedUserId,
        nickname: '',
        gender: '',
      },
      quizSetId: opp.quizSetId,
      matchScore: opp.matchScore,
      createdAt: opp.createdAt,
    }));
  }
}