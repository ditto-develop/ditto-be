import { BusinessRuleException } from '@common/exceptions/domain.exception';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '@module/user/domain/entities/user.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';
import {
  USER_SOCIAL_ACCOUNT_REPOSITORY_TOKEN,
  IUserSocialAccountRepository,
} from '@module/user/infrastructure/repository/user-social-account.repository.interface';

@Injectable()
export class RemoveSocialAccountUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
    @Inject(USER_SOCIAL_ACCOUNT_REPOSITORY_TOKEN) private readonly socialAccountRepo: IUserSocialAccountRepository,
  ) {
    console.log('[RemoveSocialAccountUseCase] RemoveSocialAccountUseCase 초기화');
  }

  async execute(userId: string, provider: string, currentUser: User): Promise<void> {
    console.log(`[RemoveSocialAccountUseCase] 소셜 계정 제거 실행: userId=${userId}, provider=${provider}`);

    // 대상 사용자 조회
    const targetUser = await this.userRepo.findById(userId);
    if (!targetUser) {
      throw new BusinessRuleException('사용자를 찾을 수 없습니다.');
    }

    // 권한 검증: 본인만 소셜 계정 제거 가능
    if (currentUser.id !== userId) {
      throw new BusinessRuleException('본인의 소셜 계정만 제거할 수 있습니다.');
    }

    // 소셜 계정 존재 확인
    const socialAccount = await this.socialAccountRepo.findByUserAndProvider(userId, provider);
    if (!socialAccount) {
      throw new BusinessRuleException('존재하지 않는 소셜 계정입니다.');
    }

    // 최소 하나의 소셜 계정은 유지되어야 함 (일반 사용자만)
    if (targetUser.isUser()) {
      const accountCount = await this.socialAccountRepo.countByUserId(userId);
      if (accountCount <= 1) {
        throw new BusinessRuleException('최소 하나의 소셜 계정은 유지되어야 합니다.');
      }
    }

    await this.socialAccountRepo.delete(userId, provider);
  }
}
