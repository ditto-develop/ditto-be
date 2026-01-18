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

    // 6. Hard Limit 적용 (5명 고정, 양방향 원칙 보장 + Shuffle)
    const allOpportunities = this.generateMatchingOpportunities(
      topPatternPairs,
      patternGroups,
      quizSetId,
      year,
      month,
      week,
    );

    // 7. Hard Limit 적용 및 양방향 일관성 보장
    const finalOpportunities = this.applyHardLimitAndBidirectionalConsistency(
      allOpportunities,
      5, // Hard Limit: 5명
    );

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

      for (let j = 0; j < groupKeys.length; j++) {
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
   * 매칭 기회 생성 (패턴+성별 그룹 기반)
   */
  private generateMatchingOpportunities(
    topPatternPairs: PatternPair[],
    patternGroups: PatternGroup,
    quizSetId: string,
    year: number,
    month: number,
    week: number,
  ): MatchingOpportunity[] {
    const opportunities: MatchingOpportunity[] = [];

    for (const pair of topPatternPairs) {
      const groupAKey = `${pair.patternA}_${pair.genderA}`;
      const groupBKey = `${pair.patternB}_${pair.genderB}`;

      const usersA = patternGroups[groupAKey] || [];
      const usersB = patternGroups[groupBKey] || [];

      // 그룹 간 모든 사용자 쌍에 대해 매칭 기회 생성
      for (const userA of usersA) {
        for (const userB of usersB) {
          // 중복 방지: userA < userB인 경우만 생성
          if (userA < userB) {
            const opportunity1 = MatchingOpportunity.create(
              `opp_${userA}_${userB}_${quizSetId}`,
              userA,
              userB,
              quizSetId,
              year,
              month,
              week,
              pair.score,
            );

            const opportunity2 = MatchingOpportunity.create(
              `opp_${userB}_${userA}_${quizSetId}`,
              userB,
              userA,
              quizSetId,
              year,
              month,
              week,
              pair.score,
            );

            opportunities.push(opportunity1, opportunity2);
          }
        }
      }
    }

    return opportunities;
  }

  /**
   * Hard Limit 적용 및 양방향 일관성 보장
   */
  private applyHardLimitAndBidirectionalConsistency(
    allOpportunities: MatchingOpportunity[],
    maxMatchesPerUser: number,
  ): MatchingOpportunity[] {
    // 사용자별 매칭 기회를 그룹핑
    const opportunitiesByUser = new Map<string, MatchingOpportunity[]>();

    for (const opp of allOpportunities) {
      if (!opportunitiesByUser.has(opp.userId)) {
        opportunitiesByUser.set(opp.userId, []);
      }
      opportunitiesByUser.get(opp.userId)!.push(opp);
    }

    // 각 사용자별로 점수 정렬 및 Hard Limit 적용
    const selectedPairs = new Set<string>();
    const userSelections = new Map<string, MatchingOpportunity[]>();

    for (const [userId, matches] of opportunitiesByUser.entries()) {
      // 점수 내림차순 정렬
      matches.sort((a, b) => b.matchScore - a.matchScore);

      // 점수 그룹별로 Shuffle하여 공정성 보장
      const shuffledMatches = this.shuffleByScoreGroup(matches);

      const userSelection: MatchingOpportunity[] = [];
      let count = 0;

      for (const match of shuffledMatches) {
        if (count >= maxMatchesPerUser) break;

        const pairKey = this.getPairKey(match.userId, match.matchedUserId);

        if (!selectedPairs.has(pairKey)) {
          userSelection.push(match);
          selectedPairs.add(pairKey);
          count++;
        }
      }

      userSelections.set(userId, userSelection);
    }

    // 양방향 일관성 재확인 및 보정
    this.ensureBidirectionalConsistency(userSelections);

    // 최종 매칭 기회 목록 생성
    const finalOpportunities: MatchingOpportunity[] = [];

    for (const [_userId, selections] of userSelections.entries()) {
      finalOpportunities.push(...selections);
    }

    return finalOpportunities;
  }

  /**
   * 점수 그룹별로 Shuffle하여 공정성 보장
   */
  private shuffleByScoreGroup(matches: MatchingOpportunity[]): MatchingOpportunity[] {
    // 점수별로 그룹핑
    const scoreGroups = new Map<number, MatchingOpportunity[]>();

    for (const match of matches) {
      if (!scoreGroups.has(match.matchScore)) {
        scoreGroups.set(match.matchScore, []);
      }
      scoreGroups.get(match.matchScore)!.push(match);
    }

    // 각 점수 그룹 내에서 Shuffle
    const shuffled: MatchingOpportunity[] = [];
    for (const [_score, group] of scoreGroups.entries()) {
      const shuffledGroup = this.shuffleArray([...group]);
      shuffled.push(...shuffledGroup);
    }

    // 점수 내림차순으로 재정렬 (Shuffle은 같은 점수 내에서만)
    shuffled.sort((a, b) => b.matchScore - a.matchScore);

    return shuffled;
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

  /**
   * 양방향 일관성 보장
   */
  private ensureBidirectionalConsistency(
    userSelections: Map<string, MatchingOpportunity[]>,
  ): void {
    const allSelections = new Map<string, boolean>();

    // 모든 선택된 쌍을 기록
    for (const [_userId, selections] of userSelections.entries()) {
      for (const selection of selections) {
        const pairKey = this.getPairKey(selection.userId, selection.matchedUserId);
        allSelections.set(pairKey, true);
      }
    }

    // 누락된 역방향 선택 추가
    for (const [pairKey, _] of allSelections.entries()) {
      const [user1, user2] = pairKey.split(':');

      // user1 → user2가 있는지 확인
      const user1Selections = userSelections.get(user1) || [];
      const hasForward = user1Selections.some(s => s.matchedUserId === user2);

      // user2 → user1이 있는지 확인
      const user2Selections = userSelections.get(user2) || [];
      const hasBackward = user2Selections.some(s => s.matchedUserId === user1);

      if (hasForward && !hasBackward) {
        // user2 → user1 추가
        const forwardOpp = user1Selections.find(s => s.matchedUserId === user2)!;
        const reverseOpp = MatchingOpportunity.create(
          `opp_${user2}_${user1}_${forwardOpp.quizSetId}`,
          user2,
          user1,
          forwardOpp.quizSetId,
          forwardOpp.year,
          forwardOpp.month,
          forwardOpp.week,
          forwardOpp.matchScore,
        );

        if (!userSelections.has(user2)) {
          userSelections.set(user2, []);
        }
        userSelections.get(user2)!.push(reverseOpp);
      }
    }
  }
}