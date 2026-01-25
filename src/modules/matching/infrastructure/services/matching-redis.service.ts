import { Injectable, Inject } from '@nestjs/common';
import { RedisService } from '@module/common/redis/redis.service';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

export interface UserAnswerData {
  bitmask: string;
  gender: string;
}

@Injectable()
export class MatchingRedisService {
  private readonly TTL_SECONDS = 14 * 24 * 60 * 60; // 14일

  constructor(
    private readonly redisService: RedisService,
    @Inject(ILOGGER_SERVICE_TOKEN)
    private readonly logger: ILoggerService,
  ) {}

  /**
   * 사용자 답안 데이터를 저장 (비트마스크 + 성별)
   */
  async storeUserAnswers(quizSetId: string, userId: string, bitmask: string, gender: string): Promise<void> {
    const key = this.getAnswersKey(quizSetId);
    const data: UserAnswerData = { bitmask, gender };

    await this.redisService.hset(key, userId, JSON.stringify(data));
    await this.redisService.expire(key, this.TTL_SECONDS);
  }

  /**
   * 퀴즈 세트의 모든 사용자 답안 데이터를 조회
   */
  async getAllUserAnswers(quizSetId: string): Promise<Record<string, UserAnswerData>> {
    const key = this.getAnswersKey(quizSetId);
    const rawData = await this.redisService.hgetall(key);

    const result: Record<string, UserAnswerData> = {};
    for (const [userId, dataStr] of Object.entries(rawData)) {
      try {
        result[userId] = JSON.parse(dataStr);
      } catch (error) {
        // 잘못된 JSON 데이터는 무시
        this.logger.warn(`잘못된 JSON 데이터`, 'MatchingRedisService', { userId, dataStr });
      }
    }

    return result;
  }

  /**
   * 완료한 사용자 목록을 추가
   */
  async addCompletedUser(quizSetId: string, userId: string): Promise<void> {
    const key = this.getCompletedKey(quizSetId);
    await this.redisService.sadd(key, userId);
    await this.redisService.expire(key, this.TTL_SECONDS);
  }

  /**
   * 완료한 사용자 목록을 조회
   */
  async getCompletedUsers(quizSetId: string): Promise<string[]> {
    const key = this.getCompletedKey(quizSetId);
    return this.redisService.smembers(key);
  }

  /**
   * 매칭 상태를 설정
   */
  async setMatchingStatus(quizSetId: string, status: 'pending' | 'processing' | 'completed' | 'failed'): Promise<void> {
    const key = this.getStatusKey(quizSetId);
    await this.redisService.set(key, status);
  }

  /**
   * 매칭 상태를 조회
   */
  async getMatchingStatus(quizSetId: string): Promise<string | null> {
    const key = this.getStatusKey(quizSetId);
    return this.redisService.get(key);
  }

  /**
   * 분산 락 획득 시도
   */
  async acquireLock(quizSetId: string): Promise<boolean> {
    const key = this.getLockKey(quizSetId);
    const result = await this.redisService.setnx(key, 'processing', 60 * 60); // 1시간 TTL
    return result === 1;
  }

  /**
   * 분산 락 해제
   */
  async releaseLock(quizSetId: string): Promise<void> {
    const key = this.getLockKey(quizSetId);
    await this.redisService.delete(key);
  }

  /**
   * 매칭 관련 모든 Redis 데이터를 삭제
   */
  async cleanupMatchingData(quizSetId: string): Promise<void> {
    const keys = [
      this.getAnswersKey(quizSetId),
      this.getCompletedKey(quizSetId),
      this.getStatusKey(quizSetId),
      this.getLockKey(quizSetId),
    ];

    for (const key of keys) {
      await this.redisService.delete(key);
    }
  }

  /**
   * Redis 키 생성 헬퍼 메서드들
   */
  private getAnswersKey(quizSetId: string): string {
    return `matching:answers:${quizSetId}`;
  }

  private getCompletedKey(quizSetId: string): string {
    return `matching:completed:${quizSetId}`;
  }

  private getStatusKey(quizSetId: string): string {
    return `matching:status:${quizSetId}`;
  }

  private getLockKey(quizSetId: string): string {
    return `matching:lock:${quizSetId}`;
  }
}