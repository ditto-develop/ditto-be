import { BusinessRuleException, EntityNotFoundException } from '@common/exceptions/domain.exception';
import { Inject, Injectable } from '@nestjs/common';
import { UserSocialAccount } from '@module/user/domain/entities/user-social-account.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';
import {
  USER_SOCIAL_ACCOUNT_REPOSITORY_TOKEN,
  IUserSocialAccountRepository,
} from '@module/user/infrastructure/repository/user-social-account.repository.interface';

export class AddSocialAccountDto {
  provider: string;
  providerUserId: string;
}

@Injectable()
export class AddSocialAccountUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
    @Inject(USER_SOCIAL_ACCOUNT_REPOSITORY_TOKEN) private readonly socialAccountRepo: IUserSocialAccountRepository,
  ) {
    console.log('[AddSocialAccountUseCase] AddSocialAccountUseCase 초기화');
  }

  async execute(userId: string, dto: AddSocialAccountDto, currentUserId: string): Promise<UserSocialAccount> {
    console.log(`[AddSocialAccountUseCase] 소셜 계정 추가 실행: userId=${userId}, provider=${dto.provider}, currentUserId=${currentUserId}`);

    // 요청자 정보 조회
    const currentUser = await this.userRepo.findById(currentUserId);
    if (!currentUser) {
      throw new EntityNotFoundException('요청자', currentUserId);
    }

    // 대상 사용자 조회
    const targetUser = await this.userRepo.findById(userId);
    if (!targetUser) {
      throw new EntityNotFoundException('사용자', userId);
    }

    // 권한 검증: 본인만 소셜 계정 추가 가능
    if (currentUser.id !== userId) {
      throw new BusinessRuleException('본인의 계정에만 소셜 계정을 추가할 수 있습니다.', 'SELF_OPERATION_ONLY');
    }

    // 소셜 계정 중복 검증
    const existingAccount = await this.socialAccountRepo.findByUserAndProvider(userId, dto.provider);
    if (existingAccount) {
      throw new BusinessRuleException('이미 등록된 소셜 로그인 제공자입니다.');
    }

    // 소셜 계정 provider/providerUserId 중복 검증
    const existingUser = await this.userRepo.findBySocialAccount(dto.provider, dto.providerUserId);
    if (existingUser) {
      throw new BusinessRuleException('이미 다른 사용자에게 등록된 소셜 계정입니다.');
    }

    // 소셜 계정 생성
    const socialAccount = UserSocialAccount.create(
      0, // ID는 DB에서 자동 생성
      userId,
      dto.provider,
      dto.providerUserId,
    );

    return await this.socialAccountRepo.create(socialAccount);
  }
}
