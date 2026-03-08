import { UserProfile } from '@module/profile/domain/entities/user-profile.entity';

export interface IUserProfileRepository {
    /**
     * userId로 프로필 조회
     */
    findByUserId(userId: string): Promise<UserProfile | null>;

    /**
     * 프로필 생성
     */
    create(profile: UserProfile): Promise<UserProfile>;

    /**
     * 프로필 업데이트
     */
    update(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;

    /**
     * 프로필 생성 또는 업데이트 (upsert)
     */
    upsert(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
}

export const USER_PROFILE_REPOSITORY_TOKEN = Symbol('IUserProfileRepository');
