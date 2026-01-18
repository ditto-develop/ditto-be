import { Injectable, Inject } from '@nestjs/common';
import { IMatchingRecordRepository, MATCHING_RECORD_REPOSITORY_TOKEN } from '@module/matching/infrastructure/repository/matching-record.repository.interface';
import { MatchingRecord } from '@module/matching/domain/entities/matching-record.entity';
import { MatchingAlreadySelectedException } from '@module/matching/domain/exceptions/matching.exceptions';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { MATCHING_NOTIFICATION_SERVICE_TOKEN, IMatchingNotificationService } from '../services/matching-notification.service.interface';

@Injectable()
export class CreateMatchingRecordUseCase {
  constructor(
    @Inject(MATCHING_RECORD_REPOSITORY_TOKEN)
    private readonly matchingRecordRepository: IMatchingRecordRepository,
    private readonly systemStateService: SystemStateService,
    @Inject(MATCHING_NOTIFICATION_SERVICE_TOKEN)
    private readonly matchingNotificationService: IMatchingNotificationService,
  ) {}

  async execute(userId: string, matchedUserId: string, quizSetId: string): Promise<MatchingRecord> {
    // 현재 주차 정보 조회
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    // 1. 한 주차에 이미 선택했는지 확인
    const existingRecords = await this.matchingRecordRepository.findByUserIdAndYearMonthWeek(
      userId,
      year,
      month,
      week,
    );

    if (existingRecords.length > 0) {
      throw new MatchingAlreadySelectedException();
    }

    // 2. 매칭 기록 생성 (초기 상태: isMatched = false)
    const record = MatchingRecord.create(
      `record_${userId}_${matchedUserId}_${quizSetId}_${year}_${month}_${week}`,
      userId,
      matchedUserId,
      quizSetId,
      year,
      month,
      week,
      false, // 초기에는 매칭되지 않은 상태
    );

    const createdRecord = await this.matchingRecordRepository.create(record);

    // 3. 양방향 선택 확인 및 매칭 성사 처리
    await this.checkAndProcessBidirectionalMatch(
      userId,
      matchedUserId,
      quizSetId,
      year,
      month,
      week,
    );

    return createdRecord;
  }

  /**
   * 양방향 선택 확인 및 매칭 성사 처리
   */
  private async checkAndProcessBidirectionalMatch(
    userId: string,
    matchedUserId: string,
    quizSetId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<void> {
    // 상대방이 나를 선택했는지 확인
    const reverseRecord = await this.matchingRecordRepository.findByUserIdAndMatchedUserIdAndYearMonthWeek(
      matchedUserId,
      userId,
      quizSetId,
      year,
      month,
      week,
    );

    if (reverseRecord) {
      // 양방향 선택이 확인됨 - 매칭 성사
      await this.matchingRecordRepository.updateIsMatched(
        userId,
        matchedUserId,
        quizSetId,
        year,
        month,
        week,
        true, // isMatched = true로 업데이트
      );

      // 매칭 성사 알림 발송 (양방향이므로 한 번만 호출)
      if (userId < matchedUserId) {
        await this.matchingNotificationService.notifyMatchingSuccess(
          userId,
          matchedUserId,
          quizSetId,
        );
      }
    }
  }
}