import { Injectable, Inject } from '@nestjs/common';
// import { IMatchingRecordRepository, MATCHING_RECORD_REPOSITORY_TOKEN } from '@module/matching/infrastructure/repository/matching-record.repository.interface';
import { MatchingRecord } from '@module/matching/domain/entities/matching-record.entity';
import { MatchingAlreadySelectedException } from '@module/matching/domain/exceptions/matching.exceptions';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { MATCHING_NOTIFICATION_SERVICE_TOKEN, IMatchingNotificationService } from '../services/matching-notification.service.interface';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class CreateMatchingRecordUseCase {
  constructor(
    // @Inject(MATCHING_RECORD_REPOSITORY_TOKEN)
    // private readonly matchingRecordRepository: IMatchingRecordRepository,
    private readonly systemStateService: SystemStateService,
    @Inject(MATCHING_NOTIFICATION_SERVICE_TOKEN)
    private readonly matchingNotificationService: IMatchingNotificationService,
    private readonly prisma: PrismaService,
    @Inject(ILOGGER_SERVICE_TOKEN)
    private readonly logger: ILoggerService,
  ) {}

  async execute(userId: string, matchedUserId: string, quizSetId: string): Promise<MatchingRecord> {
    // 현재 주차 정보 조회
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 한 주차에 이미 선택했는지 확인
      const existingRecords = await tx.matchingRecord.findMany({
        where: {
          userId,
          year,
          month,
          week,
        },
        orderBy: {
          matchedAt: 'desc',
        },
      });

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

      const created = await tx.matchingRecord.create({
        data: {
          userId: record.userId,
          matchedUserId: record.matchedUserId,
          quizSetId: record.quizSetId,
          year: record.year,
          month: record.month,
          week: record.week,
          isMatched: record.isMatched,
        },
      });

      const createdRecord = MatchingRecord.create(
        created.id,
        created.userId,
        created.matchedUserId,
        created.quizSetId,
        created.year,
        created.month,
        created.week,
        created.isMatched,
        created.matchedAt,
      );

      // 3. 양방향 선택 확인 및 매칭 성사 처리
      const isMatched = await this.checkAndProcessBidirectionalMatchInTransaction(
        tx,
        userId,
        matchedUserId,
        quizSetId,
        year,
        month,
        week,
      );

      // 업데이트 후 최신 상태 조회 (isMatched가 true로 변경되었을 수 있음)
      const updatedRecord = await tx.matchingRecord.findUnique({
        where: {
          userId_matchedUserId_quizSetId_year_month_week: {
            userId,
            matchedUserId,
            quizSetId,
            year,
            month,
            week,
          },
        },
      });

      // 최신 상태로 엔티티 재생성 (null인 경우는 이론적으로 불가능하지만 안전을 위해 fallback)
      const finalRecord = updatedRecord
        ? MatchingRecord.create(
            updatedRecord.id,
            updatedRecord.userId,
            updatedRecord.matchedUserId,
            updatedRecord.quizSetId,
            updatedRecord.year,
            updatedRecord.month,
            updatedRecord.week,
            updatedRecord.isMatched, // 최신 상태 반영
            updatedRecord.matchedAt,
          )
        : createdRecord; // fallback (이론적으로 발생하지 않음)

      return { createdRecord: finalRecord, isMatched };
    });

    // 트랜잭션 커밋 후 알림 발송
    if (result.isMatched && userId < matchedUserId) {
      try {
        await this.matchingNotificationService.notifyMatchingSuccess(
          userId,
          matchedUserId,
          quizSetId,
        );
        this.logger.log(
          '매칭 성사 알림 발송 성공',
          'CreateMatchingRecordUseCase',
          { userId, matchedUserId, quizSetId },
        );
      } catch (error) {
        // 알림 실패는 로깅만 하고 무시 (트랜잭션에 영향 없음)
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(
          '매칭 성사 알림 발송 실패',
          'CreateMatchingRecordUseCase',
          { userId, matchedUserId, quizSetId, error: errorMessage },
        );
      }
    }

    return result.createdRecord;
  }

  /**
   * 양방향 선택 확인 및 매칭 성사 처리 (트랜잭션 내)
   * @returns 매칭 성사 여부 (true: 매칭 성사, false: 단방향 선택)
   */
  private async checkAndProcessBidirectionalMatchInTransaction(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    userId: string,
    matchedUserId: string,
    quizSetId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<boolean> {
    // 상대방이 나를 선택했는지 확인
    const reverseRecord = await tx.matchingRecord.findUnique({
      where: {
        userId_matchedUserId_quizSetId_year_month_week: {
          userId: matchedUserId,
          matchedUserId: userId,
          quizSetId,
          year,
          month,
          week,
        },
      },
    });

    if (reverseRecord) {
      // 양방향 선택이 확인됨 - 매칭 성사
      // 양방향으로 업데이트 (A→B와 B→A 모두)
      await tx.matchingRecord.updateMany({
        where: {
          OR: [
            {
              userId,
              matchedUserId,
              quizSetId,
              year,
              month,
              week,
            },
            {
              userId: matchedUserId,
              matchedUserId: userId,
              quizSetId,
              year,
              month,
              week,
            },
          ],
        },
        data: {
          isMatched: true,
        },
      });

      return true; // 매칭 성사
    }

    return false; // 단방향 선택
  }
}