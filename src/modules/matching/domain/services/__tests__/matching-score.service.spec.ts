import { MatchingScoreService } from '@module/matching/domain/services/matching-score.service';
import { UserAnswerMap } from '@module/matching/domain/value-objects/match-candidate.vo';

describe('MatchingScoreService', () => {
    const service = new MatchingScoreService();

    it('should return 100% when all answers match', () => {
        const userA: UserAnswerMap = {
            userId: 'a',
            answers: new Map([['q1', 'c1'], ['q2', 'c2'], ['q3', 'c3']]),
        };
        const userB: UserAnswerMap = {
            userId: 'b',
            answers: new Map([['q1', 'c1'], ['q2', 'c2'], ['q3', 'c3']]),
        };

        const result = service.calculateScore(userA, userB);
        expect(result.quizMatchRate).toBe(100);
        expect(result.matchedQuestions).toBe(3);
        expect(result.totalQuestions).toBe(3);
        expect(result.reasons).toContain('매우 높은 일치율! 관심사가 비슷합니다.');
    });

    it('should return 0% when no answers match', () => {
        const userA: UserAnswerMap = {
            userId: 'a',
            answers: new Map([['q1', 'c1'], ['q2', 'c2']]),
        };
        const userB: UserAnswerMap = {
            userId: 'b',
            answers: new Map([['q1', 'c99'], ['q2', 'c88']]),
        };

        const result = service.calculateScore(userA, userB);
        expect(result.quizMatchRate).toBe(0);
        expect(result.matchedQuestions).toBe(0);
    });

    it('should handle partial overlap correctly', () => {
        const userA: UserAnswerMap = {
            userId: 'a',
            answers: new Map([['q1', 'c1'], ['q2', 'c2'], ['q3', 'c3'], ['q4', 'c4']]),
        };
        const userB: UserAnswerMap = {
            userId: 'b',
            answers: new Map([['q1', 'c1'], ['q2', 'c99'], ['q3', 'c3'], ['q5', 'c5']]),
        };

        // Common quizzes: q1, q2, q3 (3). Matched: q1, q3 (2). Rate = 67%
        const result = service.calculateScore(userA, userB);
        expect(result.quizMatchRate).toBe(67);
        expect(result.matchedQuestions).toBe(2);
        expect(result.totalQuestions).toBe(3);
    });

    it('should return 0 when no common quizzes', () => {
        const userA: UserAnswerMap = {
            userId: 'a',
            answers: new Map([['q1', 'c1']]),
        };
        const userB: UserAnswerMap = {
            userId: 'b',
            answers: new Map([['q99', 'c1']]),
        };

        const result = service.calculateScore(userA, userB);
        expect(result.quizMatchRate).toBe(0);
        expect(result.totalQuestions).toBe(0);
        expect(result.reasons).toContain('공통 퀴즈 답변이 없습니다.');
    });

    it('should return 0 when one user has empty answers', () => {
        const userA: UserAnswerMap = {
            userId: 'a',
            answers: new Map([['q1', 'c1']]),
        };
        const userB: UserAnswerMap = {
            userId: 'b',
            answers: new Map(),
        };

        const result = service.calculateScore(userA, userB);
        expect(result.quizMatchRate).toBe(0);
        expect(result.totalQuestions).toBe(0);
    });

    it('50% match should include moderate message', () => {
        const userA: UserAnswerMap = {
            userId: 'a',
            answers: new Map([['q1', 'c1'], ['q2', 'c2']]),
        };
        const userB: UserAnswerMap = {
            userId: 'b',
            answers: new Map([['q1', 'c1'], ['q2', 'c99']]),
        };

        const result = service.calculateScore(userA, userB);
        expect(result.quizMatchRate).toBe(50);
        expect(result.reasons).toContain('적당한 일치율을 보입니다.');
    });
});
