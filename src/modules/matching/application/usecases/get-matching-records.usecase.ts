import { Injectable, Inject } from '@nestjs/common';
import { IMatchingRecordRepository, MATCHING_RECORD_REPOSITORY_TOKEN } from '@module/matching/infrastructure/repository/matching-record.repository.interface';
import { MatchingRecordWithRelations } from '@module/matching/infrastructure/repository/matching-record.repository';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';

export interface MatchingRecordWithUser {
  id: string;
  matchedUserId: string;
  matchedUser: {
    id: string;
    nickname: string;
    gender: string;
  };
  quizSetId: string;
  isMatched: boolean;
  matchedAt: Date;
}

@Injectable()
export class GetMatchingRecordsUseCase {
  constructor(
    @Inject(MATCHING_RECORD_REPOSITORY_TOKEN)
    private readonly matchingRecordRepository: IMatchingRecordRepository,
    private readonly systemStateService: SystemStateService,
  ) {}

  async execute(userId: string, quizSetId?: string): Promise<MatchingRecordWithUser[]> {
    // 현재 주차 정보 조회
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    // 현재 주차의 매칭 기록 조회
    const records = await this.matchingRecordRepository.findByUserIdAndYearMonthWeekWithRelations(
      userId,
      year,
      month,
      week,
    );

    // 선택적으로 quizSetId로 필터링
    const filteredRecords = quizSetId
      ? records.filter(record => record.quizSetId === quizSetId)
      : records;

    // 사용자 정보와 함께 변환
    return filteredRecords.map((record: MatchingRecordWithRelations): MatchingRecordWithUser => ({
      id: record.id,
      matchedUserId: record.matchedUserId,
      matchedUser: record.matchedUser ? {
        id: record.matchedUser.id,
        nickname: record.matchedUser.nickname,
        gender: record.matchedUser.gender,
      } : {
        id: record.matchedUserId,
        nickname: '',
        gender: '',
      },
      quizSetId: record.quizSetId,
      isMatched: record.isMatched,
      matchedAt: record.matchedAt,
    }));
  }
}