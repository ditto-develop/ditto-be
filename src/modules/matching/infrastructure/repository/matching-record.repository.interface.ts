import { MatchingRecord } from '@module/matching/domain/entities/matching-record.entity';
import { MatchingRecordWithRelations } from './matching-record.repository';

export interface IMatchingRecordRepository {
  create(record: Omit<MatchingRecord, 'id' | 'matchedAt'>): Promise<MatchingRecord>;
  findByUserIdAndYearMonthWeek(userId: string, year: number, month: number, week: number): Promise<MatchingRecord[]>;
  findByUserIdAndYearMonthWeekWithRelations(userId: string, year: number, month: number, week: number): Promise<MatchingRecordWithRelations[]>;
  findByUserIdAndMatchedUserIdAndYearMonthWeek(
    userId: string,
    matchedUserId: string,
    quizSetId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<MatchingRecord | null>;
  updateIsMatched(
    userId: string,
    matchedUserId: string,
    quizSetId: string,
    year: number,
    month: number,
    week: number,
    isMatched: boolean,
  ): Promise<void>;
}

export const MATCHING_RECORD_REPOSITORY_TOKEN = Symbol('IMatchingRecordRepository');