import { UserSocialAccount } from '@module/user/domain/entities/user-social-account.entity';

export interface IUserSocialAccountRepository {
  /**
   * 소셜 계정 생성
   */
  create(userSocialAccount: UserSocialAccount): Promise<UserSocialAccount>;

  /**
   * 소셜 계정 삭제
   */
  delete(userId: string, provider: string): Promise<void>;

  /**
   * 사용자와 제공자로 소셜 계정 조회
   */
  findByUserAndProvider(userId: string, provider: string): Promise<UserSocialAccount | null>;

  /**
   * 사용자의 소셜 계정 개수 조회
   */
  countByUserId(userId: string): Promise<number>;
}

export const USER_SOCIAL_ACCOUNT_REPOSITORY_TOKEN = Symbol('IUserSocialAccountRepository');
