import { MatchingAlgorithmService } from "@module/matching/application/services/matching-algorithm.service"
import { MatchingRedisService, UserAnswerData } from "@module/matching/infrastructure/services/matching-redis.service";
import { Test, TestingModule } from "@nestjs/testing";

/**
 * @description MatchingAlgorithmService 테스트
 * 
 * 이 테스트는 매칭 알고리즘의 핵심 로직을 검증합니다.
 * 1. 사용자 답안 데이터를 패턴+성별로 그룹핑
 * 2. 이성간 패턴 쌍의 매칭 점수 계산
 * 3. 상위 20% 패턴 쌍 선별
 * 4. Hard Limit (5명) 적용
 * 5. 양방향 일관성 보장
 */
describe('MatchingAlgorithmService', () => {
  let service: MatchingAlgorithmService;
  let mockRedisService: jest.Mocked<MatchingRedisService>;

  const QUIZ_SET_ID = 'quiz-set-1';
  const YEAR = 2024;
  const MONTH = 1;
  const WEEK = 1;

  beforeEach(async () => {
    mockRedisService = {
      getAllUserAnswers: jest.fn(),
    } as unknown as jest.Mocked<MatchingRedisService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingAlgorithmService,
        {
          provide: MatchingRedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();
    
    service = module.get<MatchingAlgorithmService>(MatchingAlgorithmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * @description 테스트 케이스 1: 빈 데이터 처리
   * 
   * 시나리오: Redis에 저장된 사용자 답안이 없을 때
   * 기대 결과: 빈 배열로 반환
   */
  describe('빈 데이터 처리', () => {
    it('사용자 답안이 없으면 빈 배열을 반환해야 함', async () => {
      mockRedisService.getAllUserAnswers.mockResolvedValue({});

      const result = await service.runMatchingAlgorithm(QUIZ_SET_ID, YEAR, MONTH, WEEK);

      expect(result).toEqual([]);
      expect(mockRedisService.getAllUserAnswers).toHaveBeenCalledWith(QUIZ_SET_ID);
      expect(mockRedisService.getAllUserAnswers).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * @description 테스트 케이스 2: 기본 매칭 로직
   * 
   * 시나리오: 간단한 사용자 데이터로 기본 동작 확인
   * 기대 결과: 정상적으로 매칭 기회 생성
   */

  const testCalculateMatchScore = async (expectedScore: number, patternA: string, patternB: string) => {
    const userAnswers: Record<string, UserAnswerData> = {
      'user-1': {
        bitmask: patternA,
        gender: 'MALE',
      },
      'user-2': {
        bitmask: patternB,
        gender: 'FEMALE',
      },
    };

    mockRedisService.getAllUserAnswers.mockResolvedValue(userAnswers);

    const result = await service.runMatchingAlgorithm(QUIZ_SET_ID, YEAR, MONTH, WEEK);

    expect(result.length).toBeGreaterThan(0);

    const user1ToUser2 = result.find((opp) => opp.userId === 'user-1' && opp.matchedUserId === 'user-2');
    const user2ToUser1 = result.find((opp) => opp.userId === 'user-2' && opp.matchedUserId === 'user-1');

    expect(user1ToUser2).toBeDefined();
    expect(user2ToUser1).toBeDefined();

    expect(user1ToUser2?.matchScore).toBe(expectedScore);
    expect(user2ToUser1?.matchScore).toBe(expectedScore);
  }

  describe('기본 매칭 로직', () => {
    it('동일 패턴의 이성 사용자 간 매칭 기회를 생성해야 함', async() => await testCalculateMatchScore(12, '111111111111', '111111111111'));

    it('다른 패턴의 이성 사용자 간 매칭 점수를 올바르게 계산해야 함', async () => await testCalculateMatchScore(9, '101111111111', '111101111101'));

    it('동성 사용자는 매칭되지 않아야 함', async () => {
      const userAnswers: Record<string, UserAnswerData> = {
        'user-1': {
          bitmask: '111111111111',
          gender: 'MALE',
        },
        'user-2': {
          bitmask: '111111111111',
          gender: 'MALE',
        },
      };

      mockRedisService.getAllUserAnswers.mockResolvedValue(userAnswers);

      const result = await service.runMatchingAlgorithm(QUIZ_SET_ID, YEAR, MONTH, WEEK);

      expect(result.length).toBe(0);
    });
  });

  
  /**
   * @description 테스트 케이스 3: Hard Limit (5명 제한)
   * 
   * 시나리오: 한 사용자가 많은 매칭 기회를 가질 때
   * 기대 결과: 최대 5명까지만 매칭 기회 생성
   */
  describe('Hard Limit 적용', () => {
    it('각 사용자당 최대 5명의 매칭 기회만 생성해야 함', async () => {
      const userAnswers: Record<string, UserAnswerData> = {};

      userAnswers['user-1'] = {
        bitmask: '111111111111',
        gender: 'MALE',
      };

      for (let i = 2; i <= 11; i++) {
        userAnswers[`user-${i}`] = {
          bitmask: '111111111111',
          gender: 'FEMALE',
        };
      }

      mockRedisService.getAllUserAnswers.mockResolvedValue(userAnswers);

      const result = await service.runMatchingAlgorithm(QUIZ_SET_ID, YEAR, MONTH, WEEK);

      const user1Opportunities = result.filter((app) => app.userId === 'user-1');
      expect(user1Opportunities.length).toBeLessThanOrEqual(5);

      const userOpportunitiesMap = new Map<string, number>();
      result.forEach((app) => {
        const count = userOpportunitiesMap.get(app.userId) || 0;
        userOpportunitiesMap.set(app.userId, count + 1);
      });

      userOpportunitiesMap.forEach((count) => {
        expect(count).toBeLessThanOrEqual(5);
      });
    });
  });

  /** 
   * @description 테스트 케이스 4: 양방향 일관성
   * 
   * 시나리오: A->B 매칭이 있으면 B->A 매칭도 있어야 함
   * 기대 결과: 모든 매칭이 양방향으로 생성됨
   */
  describe('양방향 일관성 보장', () => {
    it('A->B 매칭이 있으면 B->A 매칭도 생성되어야 함', async () => {
      const userAnswers: Record<string, UserAnswerData> = {
        'user-1': {
          bitmask: '111111111111',
          gender: 'MALE',
        },
        'user-2': {
          bitmask: '111111111111',
          gender: 'FEMALE',
        },
        'user-3': {
          bitmask: '111111111110',
          gender: 'FEMALE',
        },
      };

      mockRedisService.getAllUserAnswers.mockResolvedValue(userAnswers);

      const result = await service.runMatchingAlgorithm(QUIZ_SET_ID, YEAR, MONTH, WEEK);
      
      const pairs = new Set<string>();
      result.forEach((app) => {
        const pairKey = [app.userId, app.matchedUserId].sort().join(':');
        pairs.add(pairKey);
      });

      pairs.forEach((pairKey) => {
        const [user1, user2] = pairKey.split(':');
        const forward = result.find((app) => app.userId === user1 && app.matchedUserId === user2);
        const backward = result.find((app) => app.userId === user2 && app.matchedUserId === user1);

        expect(forward).toBeDefined();
        expect(backward).toBeDefined();
      });
    });
  });

  /**
   * @description 테스트 케이스 5: 상위 20% 선별
   * 
   * 시나리오: 다양한 점수의 패턴 쌍이 있을 때
   * 기대 결과: 상위 20%만 선택되고, 동일 점수는 모두 포함
   */
  describe('상위 20% 선별', () => {
    it('상위 20% 패턴 쌍만 선택하고 동일 점수는 모두 포함해야 함', async () => {

      const userAnswers: Record<string, UserAnswerData> = {};

      userAnswers['m1'] = { bitmask: '111111111111', gender: 'MALE' };
      userAnswers['m2'] = { bitmask: '111111111111', gender: 'MALE' };
      userAnswers['m3'] = { bitmask: '111111111111', gender: 'MALE' };
      userAnswers['m4'] = { bitmask: '111111111110', gender: 'MALE' };
      userAnswers['m5'] = { bitmask: '111111111110', gender: 'MALE' };
      userAnswers['f1'] = { bitmask: '111111111111', gender: 'FEMALE' };
      userAnswers['f2'] = { bitmask: '111111111111', gender: 'FEMALE' };
      userAnswers['f3'] = { bitmask: '111111111111', gender: 'FEMALE' };
      userAnswers['f4'] = { bitmask: '111111111110', gender: 'FEMALE' };
      userAnswers['f5'] = { bitmask: '111111111110', gender: 'FEMALE' };
      userAnswers['f6'] = { bitmask: '111111111100', gender: 'FEMALE' };
      userAnswers['f7'] = { bitmask: '111111111100', gender: 'FEMALE' };
      userAnswers['f8'] = { bitmask: '111111111000', gender: 'FEMALE' };
      userAnswers['f9'] = { bitmask: '111111111000', gender: 'FEMALE' };

      mockRedisService.getAllUserAnswers.mockResolvedValue(userAnswers);

      const result = await service.runMatchingAlgorithm(QUIZ_SET_ID, YEAR, MONTH, WEEK);

      const score12Opportunities = result.filter((app) => app.matchScore === 12);
      expect(score12Opportunities.length).toBeGreaterThan(0);

      const maxScore = Math.max(...result.map((app) => app.matchScore));
      result.forEach((app) => {
        expect(app.matchScore).toBeGreaterThanOrEqual(maxScore - 2);
      });
    });
  });

  /**
   * @description 테스트 케이스 6: 복잡한 시나리오
   * 
   * 시나리오: 실제 사용에 가까운 복잡한 데이터
   * 기대 결과: 모든 규칙이 올바르게 적용됨
   */
  describe('복잡한 시나리오', () => {
    /**
     * 무작위 비트마스크 생성 헬퍼 함수
     * 12비트 비트마스크를 무작위로 생성 (0~4095 범위)
     */
    const generateRandomBitmask = (): string => {
      // 0부터 4095 사이의 무작위 숫자 생성
      const randomNumber = Math.floor(Math.random() * 4096);
      return randomNumber.toString(2).padStart(12, '0');
    };

    /**
     * @description 테스트 데이터 생성 헬퍼 함수
     * @param maleCount 남성 사용자 수
     * @param femaleCount 여성 사용자 수
     * @param useRandomPatterns 무작위 패턴 사용 여부
     */
    const generateTestData = (maleCount: number, femaleCount: number, useRandomPatterns: boolean): Record<string, UserAnswerData> => {
      const userAnswers: Record<string, UserAnswerData> = {};

      for (let i = 1; i <= maleCount; i++) {
        const bitmask = useRandomPatterns ? generateRandomBitmask() : '111111111111';
        userAnswers[`male-${i}`] = { bitmask, gender: 'MALE' };
      }
      for (let i = 1; i <= femaleCount; i++) {
        const bitmask = useRandomPatterns ? generateRandomBitmask() : '111111111111';
        userAnswers[`female-${i}`] = { bitmask, gender: 'FEMALE' };
      }

      return userAnswers;
    };

    it ('실제 사용에 가까운 복잡한 데이터에서도 모든 규칙이 올바르게 적용되어야 함', async () => {
      const userAnswers = generateTestData(50, 30, true);

      // 디버깅: 입력 데이터 분석
      console.log('\n=== 입력 데이터 분석 ===');
      const patternGroups: Record<string, { male: number; female: number }> = {};
      Object.entries(userAnswers).forEach(([_userId, data]) => {
        const pattern = parseInt(data.bitmask, 2);
        const key = `${pattern}_${data.gender}`;
        if (!patternGroups[key]) {
          patternGroups[key] = { male: 0, female: 0 };
        }
        if (data.gender === 'MALE') patternGroups[key].male++;
        else patternGroups[key].female++;
      });
      console.log('총 사용자 수:', Object.keys(userAnswers).length);
      console.log('고유 패턴 그룹 수:', Object.keys(patternGroups).length);
      
      // 남성/여성 패턴 분석
      const malePatterns = new Set<number>();
      const femalePatterns = new Set<number>();
      Object.values(userAnswers).forEach(data => {
        const pattern = parseInt(data.bitmask, 2);
        if (data.gender === 'MALE') malePatterns.add(pattern);
        else femalePatterns.add(pattern);
      });
      console.log('남성 고유 패턴 수:', malePatterns.size);
      console.log('여성 고유 패턴 수:', femalePatterns.size);
      console.log('추정 이성간 패턴 쌍 수:', malePatterns.size * femalePatterns.size);
      console.log('상위 20% 쌍 수 (추정):', Math.ceil(malePatterns.size * femalePatterns.size * 0.2));

      mockRedisService.getAllUserAnswers.mockResolvedValue(userAnswers);
      
      const result = await service.runMatchingAlgorithm(QUIZ_SET_ID, YEAR, MONTH, WEEK);

      // 디버깅: 결과 분석
      console.log('\n=== 결과 분석 ===');
      console.log('생성된 매칭 기회 수:', result.length);
      
      if (result.length === 0) {
        console.error('⚠️ 매칭 기회가 0개입니다! 알고리즘 로직을 확인해야 합니다.');
        console.log('패턴 그룹 상세:', patternGroups);
        // 결과가 0개면 테스트 실패
        expect(result.length).toBeGreaterThan(0);
        return;
      }

      // Assert 1: 결과가 비어있지 않아야 함
      expect(result.length).toBeGreaterThan(0);

      // Assert 2: 모든 매칭이 이성간이어야 함
      result.forEach((app) => {
        const userA = userAnswers[app.userId];
        const userB = userAnswers[app.matchedUserId];
        expect(userA).toBeDefined();
        expect(userB).toBeDefined();
        expect(userA.gender).not.toBe(userB.gender);
      });

      // Assert 2: 모든 매칭이 이성간이어야 함
      result.forEach((app) => {
        const userA = userAnswers[app.userId];
        const userB = userAnswers[app.matchedUserId];
        expect(userA.gender).not.toBe(userB.gender);
      });

        // Assert 3: 각 사용자별 매칭 기회 개수 확인
      const userCounts = new Map<string, number>();
      result.forEach((opp) => {
        const count = userCounts.get(opp.userId) || 0;
        userCounts.set(opp.userId, count + 1);
      });

      // 각 사용자는 최대 5명까지만 매칭 기회를 가져야 함
      userCounts.forEach((count) => {
        expect(count).toBeLessThanOrEqual(5);
      });

      // 최소한 일부 사용자는 매칭 기회를 가져야 함
      expect(userCounts.size).toBeGreaterThan(0);

      // Assert 4: 양방향 일관성 확인
      // result에 있는 모든 매칭 기회에 대해 양방향 일관성 확인
      result.forEach((opp) => {
        const forward = result.find((o) => o.userId === opp.userId && o.matchedUserId === opp.matchedUserId);
        const backward = result.find((o) => o.userId === opp.matchedUserId && o.matchedUserId === opp.userId);

        // forward는 항상 존재해야 함 (자기 자신이므로)
        expect(forward).toBeDefined();
        
        // backward도 존재해야 함 (양방향 일관성)
        expect(backward).toBeDefined();
      });

      // Assert 5: 모든 매칭 기회가 올바른 속성을 가져야 함
      result.forEach((opp) => {
        expect(opp.quizSetId).toBe(QUIZ_SET_ID);
        expect(opp.year).toBe(YEAR);
        expect(opp.month).toBe(MONTH);
        expect(opp.week).toBe(WEEK);
        expect(opp.matchScore).toBeGreaterThanOrEqual(0);
        expect(opp.matchScore).toBeLessThanOrEqual(12);
        expect(opp.userId).toBeDefined();
        expect(opp.matchedUserId).toBeDefined();
        expect(opp.userId).not.toBe(opp.matchedUserId);
      });

      // Assert 6: 통계 정보 출력 (디버깅용)
      const scores = result.map((opp) => opp.matchScore);
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      
      console.log(`총 사용자 수: ${Object.keys(userAnswers).length}`);
      console.log(`생성된 매칭 기회 수: ${result.length}`);
      console.log(`매칭 기회를 가진 사용자 수: ${userCounts.size}`);
      console.log(`점수 범위: ${minScore} ~ ${maxScore}`);
      console.log(`평균 점수: ${scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0}`);
    });
  });

  /**
   * 테스트 케이스 7: 엣지 케이스
   */

  describe('엣지 케이스', () => {
    it('단 2명의 사용자만 있을 때도 정상 동작해야 함', async () => {
      const userAnswers: Record<string, UserAnswerData> = {
        'user-1': { bitmask: '111111111111', gender: 'MALE' },
        'user-2': { bitmask: '111111111111', gender: 'FEMALE' },
      };

      mockRedisService.getAllUserAnswers.mockResolvedValue(userAnswers);

      const result = await service.runMatchingAlgorithm(QUIZ_SET_ID, YEAR, MONTH, WEEK);

      expect(result.length).toBe(2);
      expect(result[0].matchScore).toBe(12);
    });

    it ('완전히 다른 패턴의 사용자도 매칭 기회가 생성되어야 함', async () => {
      const userAnswers: Record<string, UserAnswerData> = {
        'user-1': { bitmask: '111111111111', gender: 'MALE' },
        'user-2': { bitmask: '000000000000', gender: 'FEMALE' },
      };

      mockRedisService.getAllUserAnswers.mockResolvedValue(userAnswers);

      const result = await service.runMatchingAlgorithm(QUIZ_SET_ID, YEAR, MONTH, WEEK);
      expect(result.length).toBe(2);
      expect(result[0].matchScore).toBe(0);
    });
  });
})