import { Injectable } from '@nestjs/common';
import { MatchingRedisService } from '@module/matching/infrastructure/services/matching-redis.service';
import { RunMatchingAlgorithmUseCase } from './run-matching-algorithm.usecase';
import { MatchingAlgorithmRetryException } from '@module/matching/domain/exceptions/matching.exceptions';

@Injectable()
export class RetryMatchingAlgorithmUseCase {
  constructor(
    private readonly runMatchingAlgorithmUseCase: RunMatchingAlgorithmUseCase,
    private readonly matchingRedisService: MatchingRedisService,
  ) {}

  async execute(quizSetId: string): Promise<void> {
    // 1. 현재 상태 확인 (실패한 작업만 재실행 가능)
    const currentStatus = await this.matchingRedisService.getMatchingStatus(quizSetId);

    if (currentStatus !== 'failed') {
      throw new MatchingAlgorithmRetryException(currentStatus);
    }

    // 2. 기존 매칭 알고리즘 실행 (재실행 로직 포함)
    await this.runMatchingAlgorithmUseCase.execute(quizSetId);
  }
}