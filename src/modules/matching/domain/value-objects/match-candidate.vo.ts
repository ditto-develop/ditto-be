import { ScoreBreakdown } from '@module/matching/domain/entities/match-request.entity';

/** 매칭 후보 1명에 대한 정보 */
export interface MatchCandidate {
    userId: string;
    nickname: string;
    gender: string;
    age: number;
    introduction: string | null;
    location: string | null;
    profileImageUrl: string | null;
    score: number;                    // 0~100
    scoreBreakdown: ScoreBreakdown;
}

/** 퀴즈 답변 쌍 (스코어 계산용) */
export interface UserAnswerMap {
    userId: string;
    /** quizId → choiceId */
    answers: Map<string, string>;
}

/** 알고리즘 설정 상수 */
export const MATCHING_CONSTANTS = {
    /** 최대 후보 반환 수 */
    MAX_CANDIDATES: 5,
    /** 현재 알고리즘 버전 */
    ALGORITHM_VERSION: 'v1',
} as const;
