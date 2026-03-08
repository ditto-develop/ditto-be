import {
    UserRating, RATING_MIN_SCORE, RATING_MAX_SCORE, RATING_COMMENT_MAX_LENGTH,
} from '../user-rating.entity';
import { ValidationException, BusinessRuleException } from '@common/exceptions/domain.exception';

describe('UserRating', () => {
    describe('create', () => {
        it('정상 평가 생성', () => {
            const rating = UserRating.create('id-1', 'match-1', 'user-a', 'user-b', 4, '좋았습니다');
            expect(rating.id).toBe('id-1');
            expect(rating.score).toBe(4);
            expect(rating.comment).toBe('좋았습니다');
        });

        it('코멘트 없이 생성 가능', () => {
            const rating = UserRating.create('id-1', 'match-1', 'user-a', 'user-b', 3);
            expect(rating.comment).toBeNull();
        });

        it('자기 자신 평가 → BusinessRuleException', () => {
            expect(() =>
                UserRating.create('id-1', 'match-1', 'user-a', 'user-a', 4),
            ).toThrow(BusinessRuleException);
        });

        it(`점수 ${RATING_MIN_SCORE} 미만 → ValidationException`, () => {
            expect(() =>
                UserRating.create('id-1', 'match-1', 'user-a', 'user-b', 0),
            ).toThrow(ValidationException);
        });

        it(`점수 ${RATING_MAX_SCORE} 초과 → ValidationException`, () => {
            expect(() =>
                UserRating.create('id-1', 'match-1', 'user-a', 'user-b', 6),
            ).toThrow(ValidationException);
        });

        it('소수점 점수 → ValidationException', () => {
            expect(() =>
                UserRating.create('id-1', 'match-1', 'user-a', 'user-b', 3.5),
            ).toThrow(ValidationException);
        });

        it(`코멘트 ${RATING_COMMENT_MAX_LENGTH}자 초과 → ValidationException`, () => {
            const longComment = 'a'.repeat(RATING_COMMENT_MAX_LENGTH + 1);
            expect(() =>
                UserRating.create('id-1', 'match-1', 'user-a', 'user-b', 4, longComment),
            ).toThrow(ValidationException);
        });

        it('경계값: 최소/최대 점수 정상 생성', () => {
            expect(UserRating.create('id-1', 'm', 'a', 'b', RATING_MIN_SCORE).score).toBe(RATING_MIN_SCORE);
            expect(UserRating.create('id-2', 'm', 'a', 'b', RATING_MAX_SCORE).score).toBe(RATING_MAX_SCORE);
        });
    });
});
