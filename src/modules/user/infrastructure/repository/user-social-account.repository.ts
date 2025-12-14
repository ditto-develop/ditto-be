import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { UserSocialAccount } from '@module/user/domain/entities/user-social-account.entity';
import { IUserSocialAccountRepository } from '@module/user/infrastructure/repository/user-social-account.repository.interface';

@Injectable()
export class UserSocialAccountRepository implements IUserSocialAccountRepository {
  constructor(private readonly prisma: PrismaService) {
    console.log('[UserSocialAccountRepository] UserSocialAccountRepository 초기화');
  }

  async create(userSocialAccount: UserSocialAccount): Promise<UserSocialAccount> {
    console.log(
      `[UserSocialAccountRepository] 소셜 계정 생성: userId=${userSocialAccount.userId}, provider=${userSocialAccount.provider}`,
    );
    const createdAccount = await this.prisma.userSocialAccount.create({
      data: {
        userId: userSocialAccount.userId,
        provider: userSocialAccount.provider,
        providerUserId: userSocialAccount.providerUserId,
      },
    });
    return this.toDomain(createdAccount);
  }

  async delete(userId: string, provider: string): Promise<void> {
    console.log(`[UserSocialAccountRepository] 소셜 계정 삭제: userId=${userId}, provider=${provider}`);
    await this.prisma.userSocialAccount.deleteMany({
      where: {
        userId,
        provider,
      },
    });
  }

  async findByUserAndProvider(userId: string, provider: string): Promise<UserSocialAccount | null> {
    console.log(`[UserSocialAccountRepository] 소셜 계정 조회: userId=${userId}, provider=${provider}`);
    const account = await this.prisma.userSocialAccount.findFirst({
      where: {
        userId,
        provider,
      },
    });
    return account ? this.toDomain(account) : null;
  }

  async countByUserId(userId: string): Promise<number> {
    console.log(`[UserSocialAccountRepository] 소셜 계정 개수 조회: userId=${userId}`);
    return await this.prisma.userSocialAccount.count({
      where: { userId },
    });
  }

  private toDomain(account: any): UserSocialAccount {
    return UserSocialAccount.create(account.id, account.userId, account.provider, account.providerUserId);
  }
}
