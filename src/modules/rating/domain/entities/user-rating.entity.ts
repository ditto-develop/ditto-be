import { ValidationException, BusinessRuleException } from '@common/exceptions/domain.exception';

/** 평가 점수 범위 */
export const RATING_MIN_SCORE = 1;
export const RATING_MAX_SCORE = 5;

/** 평가 코멘트 최대 길이 */
export const RATING_COMMENT_MAX_LENGTH = 500;

/** 평가 공개 최소 개수 */
export const RATING_PUBLIC_THRESHOLD = 3;

export class UserRating {
    constructor(
        public readonly id: string,
        public readonly matchRequestId: string,
        public readonly fromUserId: string,
        public readonly toUserId: string,
        public readonly score: number,
        public readonly comment: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }

    static create(
        id: string,
        matchRequestId: string,
        fromUserId: string,
        toUserId: string,
        score: number,
        comment: string | null = null,
    ): UserRating {
        if (fromUserId === toUserId) {
            throw new BusinessRuleException('자기 자신을 평가할 수 없습니다.');
        }

        const rating = new UserRating(
            id, matchRequestId, fromUserId, toUserId,
            score, comment, new Date(), new Date(),
        );
        rating.validate();
        return rating;
    }

    validate(): void {
        if (this.score < RATING_MIN_SCORE || this.score > RATING_MAX_SCORE) {
            throw new ValidationException(
                `평가 점수는 ${RATING_MIN_SCORE}~${RATING_MAX_SCORE}점 사이여야 합니다.`,
            );
        }

        if (!Number.isInteger(this.score)) {
            throw new ValidationException('평가 점수는 정수여야 합니다.');
        }

        if (this.comment && this.comment.length > RATING_COMMENT_MAX_LENGTH) {
            throw new ValidationException(
                `평가 코멘트는 최대 ${RATING_COMMENT_MAX_LENGTH}자까지 입력할 수 있습니다.`,
            );
        }
    }
}
