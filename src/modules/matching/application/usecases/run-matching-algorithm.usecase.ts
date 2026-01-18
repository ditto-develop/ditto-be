import { Injectable, Inject } from '@nestjs/common';
import { MatchingAlgorithmService } from '../services/matching-algorithm.service';
import { MatchingRedisService } from '@module/matching/infrastructure/services/matching-redis.service';
import { MatchingDataCollectionService } from '@module/matching/infrastructure/services/matching-data-collection.service';
import { IMatchingOpportunityRepository, MATCHING_OPPORTUNITY_REPOSITORY_TOKEN } from '@module/matching/infrastructure/repository/matching-opportunity.repository.interface';
import { MatchingAlgorithmAlreadyExecutedException, MatchingAlgorithmInProgressException } from '@module/matching/domain/exceptions/matching.exceptions';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';

@Injectable()
export class RunMatchingAlgorithmUseCase {
  constructor(
    private readonly matchingAlgorithmService: MatchingAlgorithmService,
    private readonly matchingRedisService: MatchingRedisService,
    private readonly matchingDataCollectionService: MatchingDataCollectionService,
    @Inject(MATCHING_OPPORTUNITY_REPOSITORY_TOKEN)
    private readonly matchingOpportunityRepository: IMatchingOpportunityRepository,
    private readonly systemStateService: SystemStateService,
  ) {}

  async execute(quizSetId: string): Promise<void> {
    // 1. 재실행 방지 체크
    const hasOpportunities = await this.matchingOpportunityRepository.existsByQuizSetId(quizSetId);
    if (hasOpportunities) {
      throw new MatchingAlgorithmAlreadyExecutedException(quizSetId);
    }

    // 2. 실행 중 상태 체크
    const currentStatus = await this.matchingRedisService.getMatchingStatus(quizSetId);
    if (currentStatus === 'processing') {
      throw new MatchingAlgorithmInProgressException(quizSetId);
    }

    // 3. 분산 락 획득
    const lockAcquired = await this.matchingRedisService.acquireLock(quizSetId);
    if (!lockAcquired) {
      throw new MatchingAlgorithmInProgressException(quizSetId);
    }

    try {
      // 4. 상태를 processing으로 변경
      await this.matchingRedisService.setMatchingStatus(quizSetId, 'processing');

      // 5. 답안 데이터 수집 및 Redis 저장
      const collectedCount = await this.matchingDataCollectionService.collectAndStoreUserAnswers(quizSetId);
      if (collectedCount === 0) {
        // 수집된 데이터가 없으면 알고리즘 실행하지 않음
        await this.matchingRedisService.setMatchingStatus(quizSetId, 'completed');
        return;
      }

      // 6. 현재 주차 정보 조회
      const year = await this.systemStateService.getCurrentYear();
      const month = await this.systemStateService.getCurrentMonth();
      const week = await this.systemStateService.getCurrentWeek();

      // 7. 매칭 알고리즘 실행
      const opportunities = await this.matchingAlgorithmService.runMatchingAlgorithm(
        quizSetId,
        year,
        month,
        week,
      );

      // 7. Bulk Insert
      await this.matchingOpportunityRepository.createMany(opportunities);

      // 8. 상태를 completed로 변경
      await this.matchingRedisService.setMatchingStatus(quizSetId, 'completed');

    } catch (error) {
      // 에러 발생 시 상태를 failed로 변경
      await this.matchingRedisService.setMatchingStatus(quizSetId, 'failed');
      throw error;
    } finally {
      // 9. 락 해제
      await this.matchingRedisService.releaseLock(quizSetId);
    }
  }
}