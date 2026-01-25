import { Injectable, Inject } from '@nestjs/common';
import { IMatchingOpportunityRepository, MATCHING_OPPORTUNITY_REPOSITORY_TOKEN } from '@module/matching/infrastructure/repository/matching-opportunity.repository.interface';
import { MatchingOpportunityWithRelations } from '@module/matching/infrastructure/repository/matching-opportunity.repository';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';

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
    private readonly systemStateService: SystemStateService,
  ) {}

  async execute(userId: string, quizSetId?: string): Promise<MatchingOpportunityWithUser[]> {
    // 현재 주차 정보 조회
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    // 현재 주차의 매칭 기회만 조회 (이전 주차 제외)
    const opportunities = await this.matchingOpportunityRepository.findByUserIdAndYearMonthWeekWithRelations(
      userId,
      year,
      month,
      week,
    );

    // 선택적으로 quizSetId로 필터링
    const filteredOpportunities = quizSetId
      ? opportunities.filter(opp => opp.quizSetId === quizSetId)
      : opportunities;

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