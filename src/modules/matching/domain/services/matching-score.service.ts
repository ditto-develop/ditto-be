import { Injectable } from '@nestjs/common';
import { ScoreBreakdown } from '@module/matching/domain/entities/match-request.entity';
import { UserAnswerMap } from '@module/matching/domain/value-objects/match-candidate.vo';

/**
 * 매칭 스코어 계산기 — 순수 함수 기반
 *
 * v1 알고리즘: 퀴즈 답변 일치율
 * - 두 사용자가 동일 quizId에 동일 choiceId를 선택한 비율
 * - score = (matchedQuestions / totalQuestions) * 100
 */
@Injectable()
export class MatchingScoreService {
    /**
     * 두 사용자의 퀴즈 답변 일치율 계산
     * @returns ScoreBreakdown (quizMatchRate, matchedQuestions, totalQuestions, reasons)
     */
    calculateScore(userA: UserAnswerMap, userB: UserAnswerMap): ScoreBreakdown {
        return MatchingScoreService.computeQuizMatchRate(userA, userB);
    }

    /**
     * 순수 함수: 퀴즈 답변 일치율 산출
     */
    static computeQuizMatchRate(userA: UserAnswerMap, userB: UserAnswerMap): ScoreBreakdown {
        // 두 사용자가 모두 답변한 퀴즈만 비교
        const commonQuizIds: string[] = [];
        for (const quizId of userA.answers.keys()) {
            if (userB.answers.has(quizId)) {
                commonQuizIds.push(quizId);
            }
        }

        const totalQuestions = commonQuizIds.length;

        if (totalQuestions === 0) {
            return {
                quizMatchRate: 0,
                matchedQuestions: 0,
                totalQuestions: 0,
                reasons: ['공통 퀴즈 답변이 없습니다.'],
            };
        }

        let matchedQuestions = 0;
        const matchedQuizIds: string[] = [];

        for (const quizId of commonQuizIds) {
            if (userA.answers.get(quizId) === userB.answers.get(quizId)) {
                matchedQuestions++;
                matchedQuizIds.push(quizId);
            }
        }

        const quizMatchRate = Math.round((matchedQuestions / totalQuestions) * 100);

        const reasons: string[] = [];
        reasons.push(`공통 퀴즈 ${totalQuestions}문제 중 ${matchedQuestions}문제 일치 (${quizMatchRate}%)`);

        if (quizMatchRate >= 80) {
            reasons.push('매우 높은 일치율! 관심사가 비슷합니다.');
        } else if (quizMatchRate >= 50) {
            reasons.push('적당한 일치율을 보입니다.');
        } else {
            reasons.push('일치율이 낮지만 다양한 의견을 가진 상대입니다.');
        }

        return {
            quizMatchRate,
            matchedQuestions,
            totalQuestions,
            reasons,
        };
    }
}
