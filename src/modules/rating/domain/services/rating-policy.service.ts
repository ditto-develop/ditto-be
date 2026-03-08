import { Injectable } from '@nestjs/common';
import { RATING_PUBLIC_THRESHOLD } from '@module/rating/domain/entities/user-rating.entity';

/**
 * 평가 공개 정책 서비스
 *
 * 정책: 누적 평가가 RATING_PUBLIC_THRESHOLD(3)개 이상일 때만 공개
 * - 미달 시: 평가 수와 "아직 공개되지 않았습니다" 메시지만 노출
 * - 충족 시: 평균 점수, 개별 평가 내용 공개
 */
@Injectable()
export class RatingPolicyService {
    /** 평가 공개 가능 여부 */
    static isPublic(ratingCount: number): boolean {
        return ratingCount >= RATING_PUBLIC_THRESHOLD;
    }

    /** 평가 공개 기준 수 */
    static getThreshold(): number {
        return RATING_PUBLIC_THRESHOLD;
    }

    /** 평균 점수 계산 */
    static calculateAverageScore(scores: number[]): number {
        if (scores.length === 0) return 0;
        const sum = scores.reduce((acc, s) => acc + s, 0);
        return Math.round((sum / scores.length) * 10) / 10; // 소수점 1자리
    }

    isPublic(ratingCount: number): boolean {
        return RatingPolicyService.isPublic(ratingCount);
    }

    getThreshold(): number {
        return RatingPolicyService.getThreshold();
    }

    calculateAverageScore(scores: number[]): number {
        return RatingPolicyService.calculateAverageScore(scores);
    }
}
