export class UserSocialAccount {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly provider: string,
    public readonly providerUserId: string,
  ) {}

  static create(id: number, userId: string, provider: string, providerUserId: string): UserSocialAccount {
    if (!provider?.trim()) {
      throw new Error('소셜 로그인 제공자는 필수입니다.');
    }
    if (!providerUserId?.trim()) {
      throw new Error('소셜 로그인 제공자 사용자 ID는 필수입니다.');
    }

    return new UserSocialAccount(id, userId, provider, providerUserId);
  }

  /**
   * 같은 소셜 로그인 제공자인지 확인
   */
  isSameProvider(provider: string): boolean {
    return this.provider === provider;
  }

  /**
   * 같은 소셜 로그인 제공자의 같은 사용자인지 확인
   */
  isSameProviderUser(provider: string, providerUserId: string): boolean {
    return this.provider === provider && this.providerUserId === providerUserId;
  }
}
