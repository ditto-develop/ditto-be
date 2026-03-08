import { ValidationException, BusinessRuleException } from '@common/exceptions/domain.exception';

/** 자기소개 최대 글자 수 */
export const INTRODUCTION_MAX_LENGTH = 300;

/** 선호 나이 범위 */
export const PREFERRED_AGE_MIN = 18;
export const PREFERRED_AGE_MAX = 100;

export class UserProfile {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly introduction: string | null,
        public readonly preferredMinAge: number | null,
        public readonly preferredMaxAge: number | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }

    static create(
        id: string,
        userId: string,
        introduction: string | null = null,
        preferredMinAge: number | null = null,
        preferredMaxAge: number | null = null,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date(),
    ): UserProfile {
        const profile = new UserProfile(
            id,
            userId,
            introduction,
            preferredMinAge,
            preferredMaxAge,
            createdAt,
            updatedAt,
        );
        profile.validate();
        return profile;
    }

    update(props: {
        introduction?: string | null;
        preferredMinAge?: number | null;
        preferredMaxAge?: number | null;
    }): UserProfile {
        const updated = new UserProfile(
            this.id,
            this.userId,
            props.introduction !== undefined ? props.introduction : this.introduction,
            props.preferredMinAge !== undefined ? props.preferredMinAge : this.preferredMinAge,
            props.preferredMaxAge !== undefined ? props.preferredMaxAge : this.preferredMaxAge,
            this.createdAt,
            new Date(),
        );
        updated.validate();
        return updated;
    }

    validate(): void {
        // 자기소개 길이 검증
        if (this.introduction && this.introduction.length > INTRODUCTION_MAX_LENGTH) {
            throw new ValidationException(
                `자기소개는 최대 ${INTRODUCTION_MAX_LENGTH}자까지 입력할 수 있습니다.`,
            );
        }

        // 선호 나이 범위 검증
        if (this.preferredMinAge !== null && this.preferredMinAge < PREFERRED_AGE_MIN) {
            throw new ValidationException(
                `선호 최소 나이는 ${PREFERRED_AGE_MIN}세 이상이어야 합니다.`,
            );
        }

        if (this.preferredMaxAge !== null && this.preferredMaxAge > PREFERRED_AGE_MAX) {
            throw new ValidationException(
                `선호 최대 나이는 ${PREFERRED_AGE_MAX}세 이하여야 합니다.`,
            );
        }

        if (
            this.preferredMinAge !== null &&
            this.preferredMaxAge !== null &&
            this.preferredMinAge > this.preferredMaxAge
        ) {
            throw new BusinessRuleException(
                '선호 최소 나이는 최대 나이보다 작거나 같아야 합니다.',
            );
        }
    }
}
