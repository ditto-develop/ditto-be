import { Injectable } from '@nestjs/common';
import { MatchingRedisService, UserAnswerData } from '@module/matching/infrastructure/services/matching-redis.service';
import { MatchingOpportunity } from '@module/matching/domain/entities/matching-opportunity.entity';

export interface PatternPair {
  patternA: number;
  genderA: string;
  patternB: number;
  genderB: string;
  score: number;
}

export interface PatternGroup {
  [patternGender: string]: string[]; // key: `${pattern}_${gender}`, value: userIds
}

export interface LightweightCandidate {
  userId: string;
  matchedUserId: string;
  score: number;
  pairId: string; // 중복 방지용 (ex: "minId:maxId")
}

@Injectable()
export class MatchingAlgorithmService {
  constructor(private readonly redisService: MatchingRedisService) {}

  /**
   * 매칭 알고리즘 실행 (패턴+성별 그룹핑 + 이성 매칭 제약)
   */
  async runMatchingAlgorithm(
    quizSetId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<MatchingOpportunity[]> {
    // 1. Redis에서 모든 사용자 답안 데이터 로드
    const allUserAnswers = await this.redisService.getAllUserAnswers(quizSetId);

    if (Object.keys(allUserAnswers).length === 0) {
      return []; // 데이터가 없으면 빈 배열 반환
    }

    // 2. 패턴+성별별로 사용자 그룹핑
    const patternGroups = this.groupUsersByPatternAndGender(allUserAnswers);

    // 3. 이성간 패턴 쌍 비교 및 점수 계산
    const patternPairs = this.calculateOppositeGenderPatternScores(patternGroups);

    // 4. 점수 내림차순 정렬
    patternPairs.sort((a, b) => b.score - a.score);

    // 5. 상위 20% 계산 (동일 점수 모두 포함)
    const top20PercentCount = Math.ceil(patternPairs.length * 0.2);
    const topPatternPairs = this.getTopPatternPairs(patternPairs, top20PercentCount);

    // 디버깅: 중간 결과 확인
    if (process.env.NODE_ENV === 'test' || process.env.DEBUG_MATCHING) {
      console.log(`[MatchingAlgorithm] 패턴 쌍 수: ${patternPairs.length}, 상위 20% 쌍 수: ${topPatternPairs.length}`);
    }

    // 6. 가벼운 매칭 후보 생성 (메모리 효율성)
    const candidates = this.generateLightweightCandidates(topPatternPairs, patternGroups);

    // 디버깅: 중간 결과 확인
    if (process.env.NODE_ENV === 'test' || process.env.DEBUG_MATCHING) {
      console.log(`[MatchingAlgorithm] 생성된 후보 수: ${candidates.length}`);
    }

    // 7. Global Greedy Matching 실행 (Hard Limit과 양방향 일관성 동시 보장)
    const finalPairs = this.executeGlobalGreedyMatching(candidates, 5); // Hard Limit: 5명

    // 디버깅: 중간 결과 확인
    if (process.env.NODE_ENV === 'test' || process.env.DEBUG_MATCHING) {
      console.log(`[MatchingAlgorithm] 최종 매칭 쌍 수: ${finalPairs.length}`);
    }

    // 8. 최종 확정된 쌍에 대해서만 MatchingOpportunity 엔티티 생성
    const finalOpportunities = this.createMatchingOpportunitiesFromPairs(
      finalPairs,
      quizSetId,
      year,
      month,
      week,
    );

    // 디버깅: 최종 결과 확인
    if (process.env.NODE_ENV === 'test' || process.env.DEBUG_MATCHING) {
      console.log(`[MatchingAlgorithm] 최종 매칭 기회 수: ${finalOpportunities.length}`);
    }

    return finalOpportunities;
  }

  /**
   * 사용자들을 답안 패턴 + 성별별로 그룹핑
   */
  private groupUsersByPatternAndGender(userAnswers: Record<string, UserAnswerData>): PatternGroup {
    const groups: PatternGroup = {};

    for (const [userId, data] of Object.entries(userAnswers)) {
      const pattern = parseInt(data.bitmask, 2);
      const groupKey = `${pattern}_${data.gender}`;

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(userId);
    }

    return groups;
  }

  /**
   * 이성간 패턴 쌍에 대한 매칭 점수 계산
   */
  private calculateOppositeGenderPatternScores(patternGroups: PatternGroup): PatternPair[] {
    const pairs: PatternPair[] = [];
    const groupKeys = Object.keys(patternGroups);

    for (let i = 0; i < groupKeys.length; i++) {
      const partsA = groupKeys[i].split('_');
      const patternA: number = parseInt(partsA[0], 10);
      const genderA: string = partsA[1];

      // j = i부터 시작하여 중복 패턴 쌍 제거
      for (let j = i; j < groupKeys.length; j++) {
        const partsB = groupKeys[j].split('_');
        const patternB: number = parseInt(partsB[0], 10);
        const genderB: string = partsB[1];

        // 이성간만 비교 (동성 제외)
        if (genderA === genderB) continue;

        let score: number;

        if (patternA === patternB) {
          // 같은 패턴, 이성: 12점 (만점)
          score = 12;
        } else {
          // 다른 패턴, 이성: XOR 연산으로 점수 계산
          score = this.calculateMatchScore(patternA, patternB);
        }

        pairs.push({
          patternA,
          genderA,
          patternB,
          genderB,
          score,
        });
      }
    }

    return pairs;
  }

  /**
   * 두 패턴 간 매칭 점수 계산 (XOR 연산)
   */
  private calculateMatchScore(patternA: number, patternB: number): number {
    const diff = patternA ^ patternB;
    const differentBits = this.popcount(diff);
    return 12 - differentBits; // 총 12문제 중 같은 답안 개수
  }

  /**
   * 비트 개수 계산 (popcount)
   */
  private popcount(n: number): number {
    let count = 0;
    while (n) {
      count += n & 1;
      n >>>= 1;
    }
    return count;
  }

  /**
   * 상위 20% 패턴 쌍 선별 (동일 점수 모두 포함)
   */
  private getTopPatternPairs(patternPairs: PatternPair[], topCount: number): PatternPair[] {
    const result: PatternPair[] = [];
    let currentScore = -1;
    let count = 0;

    for (const pair of patternPairs) {
      if (count >= topCount && pair.score !== currentScore) break;

      result.push(pair);
      currentScore = pair.score;
      count++;
    }

    return result;
  }

  /**
   * 가벼운 매칭 후보 생성 (메모리 효율성을 위한 Plain Object만 생성)
   */
  private generateLightweightCandidates(
    topPatternPairs: PatternPair[],
    patternGroups: PatternGroup,
  ): LightweightCandidate[] {
    const candidates: LightweightCandidate[] = [];

    // 디버깅: 패턴 그룹 키 확인
    if (process.env.NODE_ENV === 'test' || process.env.DEBUG_MATCHING) {
      const patternGroupKeys = Object.keys(patternGroups);
      console.log(`[generateLightweightCandidates] 패턴 그룹 키 수: ${patternGroupKeys.length}`);
      if (topPatternPairs.length > 0) {
        const firstPair = topPatternPairs[0];
        const groupAKey = `${firstPair.patternA}_${firstPair.genderA}`;
        const groupBKey = `${firstPair.patternB}_${firstPair.genderB}`;
        console.log(`[generateLightweightCandidates] 첫 번째 쌍 키: ${groupAKey}, ${groupBKey}`);
        console.log(`[generateLightweightCandidates] 그룹 A 존재: ${patternGroups[groupAKey] ? '있음' : '없음'}, 그룹 B 존재: ${patternGroups[groupBKey] ? '있음' : '없음'}`);
        if (patternGroups[groupAKey]) {
          console.log(`[generateLightweightCandidates] 그룹 A 사용자 수: ${patternGroups[groupAKey].length}`);
        }
        if (patternGroups[groupBKey]) {
          console.log(`[generateLightweightCandidates] 그룹 B 사용자 수: ${patternGroups[groupBKey].length}`);
        }
      }
    }

    for (const pair of topPatternPairs) {
      const groupAKey = `${pair.patternA}_${pair.genderA}`;
      const groupBKey = `${pair.patternB}_${pair.genderB}`;

      const usersA = patternGroups[groupAKey] || [];
      const usersB = patternGroups[groupBKey] || [];

      // 그룹 간 모든 사용자 쌍에 대해 가벼운 후보 생성
      for (const userA of usersA) {
        for (const userB of usersB) {
          // 중복 방지: userA와 userB가 다른 경우만 생성
          if (userA !== userB) {
            // ID 대소비교로 유니크 키 생성 (양방향 중 하나만 생성)
            const [minId, maxId] = userA < userB ? [userA, userB] : [userB, userA];
            const pairId = this.getPairKey(userA, userB);
            
            candidates.push({
              userId: minId,
              matchedUserId: maxId,
              score: pair.score,
              pairId,
            });
          }
        }
      }
    }

    // 디버깅: 생성된 후보 수 확인
    if (process.env.NODE_ENV === 'test' || process.env.DEBUG_MATCHING) {
      console.log(`[generateLightweightCandidates] 생성된 후보 수: ${candidates.length}`);
    }

    return candidates;
  }

  /**
   * Global Greedy Matching 실행 (Hard Limit과 양방향 일관성을 한 번의 패스로 보장)
   */
  private executeGlobalGreedyMatching(
    candidates: LightweightCandidate[],
    limit: number,
  ): LightweightCandidate[] {
    // 1. 점수별로 그룹핑 (동점자 처리)
    const scoreGroups = new Map<number, LightweightCandidate[]>();
    for (const candidate of candidates) {
      if (!scoreGroups.has(candidate.score)) {
        scoreGroups.set(candidate.score, []);
      }
      scoreGroups.get(candidate.score)!.push(candidate);
    }

    // 2. 점수 내림차순으로 정렬된 그룹 리스트 생성
    const sortedScores = Array.from(scoreGroups.keys()).sort((a, b) => b - a);
    
    // 3. 각 점수 그룹 내에서 Shuffle (공정성 보장)
    const shuffledCandidates: LightweightCandidate[] = [];
    for (const score of sortedScores) {
      const group = scoreGroups.get(score)!;
      const shuffled = this.shuffleArray([...group]);
      shuffledCandidates.push(...shuffled);
    }

    // 4. Global Greedy Matching 실행
    const userMatchCounts = new Map<string, number>();
    const finalResults: LightweightCandidate[] = [];

    for (const candidate of shuffledCandidates) {
      const countA = userMatchCounts.get(candidate.userId) || 0;
      const countB = userMatchCounts.get(candidate.matchedUserId) || 0;

      // 두 사용자 모두 슬롯이 남아있을 때만 매칭 성사 (양방향 일관성과 Hard Limit 동시 만족)
      if (countA < limit && countB < limit) {
        finalResults.push(candidate);
        
        userMatchCounts.set(candidate.userId, countA + 1);
        userMatchCounts.set(candidate.matchedUserId, countB + 1);
      }
    }

    // 디버깅: 최종 매칭 결과 확인
    if (process.env.NODE_ENV === 'test' || process.env.DEBUG_MATCHING) {
      console.log(`[executeGlobalGreedyMatching] 최종 매칭 쌍 수: ${finalResults.length}`);
    }

    return finalResults;
  }

  /**
   * 최종 확정된 쌍에 대해서만 MatchingOpportunity 엔티티 생성
   */
  private createMatchingOpportunitiesFromPairs(
    finalPairs: LightweightCandidate[],
    quizSetId: string,
    year: number,
    month: number,
    week: number,
  ): MatchingOpportunity[] {
    const opportunities: MatchingOpportunity[] = [];

    for (const pair of finalPairs) {
      // 양방향 MatchingOpportunity 생성
      const opp1 = MatchingOpportunity.create(
        `opp_${pair.userId}_${pair.matchedUserId}_${quizSetId}`,
        pair.userId,
        pair.matchedUserId,
        quizSetId,
        year,
        month,
        week,
        pair.score,
      );

      const opp2 = MatchingOpportunity.create(
        `opp_${pair.matchedUserId}_${pair.userId}_${quizSetId}`,
        pair.matchedUserId,
        pair.userId,
        quizSetId,
        year,
        month,
        week,
        pair.score,
      );

      opportunities.push(opp1, opp2);
    }

    return opportunities;
  }


  /**
   * Fisher-Yates Shuffle 알고리즘
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 쌍 키 생성 (양방향 일관성 보장용)
   */
  private getPairKey(userId1: string, userId2: string): string {
    return userId1 < userId2 ? `${userId1}:${userId2}` : `${userId2}:${userId1}`;
  }
}