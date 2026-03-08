import { RatingPolicyService } from '@module/rating/domain/services/rating-policy.service';
import { RATING_PUBLIC_THRESHOLD } from '@module/rating/domain/entities/user-rating.entity';

describe('RatingPolicyService', () => {
    const service = new RatingPolicyService();

    describe('isPublic', () => {
        it('평가 0개 → 비공개', () => {
            expect(service.isPublic(0)).toBe(false);
        });

        it('평가 2개 → 비공개', () => {
            expect(service.isPublic(2)).toBe(false);
        });

        it('평가 3개 → 공개', () => {
            expect(service.isPublic(3)).toBe(true);
        });

        it('평가 10개 → 공개', () => {
            expect(service.isPublic(10)).toBe(true);
        });

        it('기준값과 일치 테스트', () => {
            expect(service.isPublic(RATING_PUBLIC_THRESHOLD - 1)).toBe(false);
            expect(service.isPublic(RATING_PUBLIC_THRESHOLD)).toBe(true);
        });
    });

    describe('getThreshold', () => {
        it('기준값 반환', () => {
            expect(service.getThreshold()).toBe(RATING_PUBLIC_THRESHOLD);
        });
    });

    describe('calculateAverageScore', () => {
        it('빈 배열 → 0', () => {
            expect(service.calculateAverageScore([])).toBe(0);
        });

        it('단일 점수 → 그대로', () => {
            expect(service.calculateAverageScore([4])).toBe(4);
        });

        it('여러 점수 → 평균 (소수점 1자리 반올림)', () => {
            expect(service.calculateAverageScore([3, 4, 5])).toBe(4);
        });

        it('3, 3, 4 → 3.3', () => {
            expect(service.calculateAverageScore([3, 3, 4])).toBe(3.3);
        });

        it('1, 5 → 3', () => {
            expect(service.calculateAverageScore([1, 5])).toBe(3);
        });
    });
});
