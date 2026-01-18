import { MatchingOpportunity } from '@module/matching/domain/entities/matching-opportunity.entity';

export interface IMatchingOpportunityRepository {
  createMany(opportunities: Omit<MatchingOpportunity, 'id' | 'createdAt'>[]): Promise<void>;
  findByUserIdAndYearMonthWeek(userId: string, year: number, month: number, week: number): Promise<MatchingOpportunity[]>;
  existsByQuizSetId(quizSetId: string): Promise<boolean>;
  deleteOlderThan(date: Date): Promise<number>;
}

export const MATCHING_OPPORTUNITY_REPOSITORY_TOKEN = Symbol('IMatchingOpportunityRepository');