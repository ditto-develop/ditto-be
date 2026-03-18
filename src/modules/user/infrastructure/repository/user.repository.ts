import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { User, Gender } from '@module/user/domain/entities/user.entity';
import { UserSocialAccount } from '@module/user/domain/entities/user-social-account.entity';
import { Role } from '@module/role/domain/entities/role.entity';
import { IUserRepository } from '@module/user/infrastructure/repository/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {
    console.log('[UserRepository] UserRepository 초기화');
  }

  async findAll(): Promise<User[]> {
    console.log('[UserRepository] 모든 사용자 조회');
    const users = await this.prisma.user.findMany({
      include: {
        role: true,
        socialAccounts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.toDomain(user));
  }

  async findById(id: string): Promise<User | null> {
    console.log(`[UserRepository] 사용자 조회: id=${id}`);
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        socialAccounts: true,
      },
    });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    console.log(`[UserRepository] 사용자 조회: email=${email}`);
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        socialAccounts: true,
      },
    });
    return user ? this.toDomain(user) : null;
  }

  async findByNickname(nickname: string): Promise<User | null> {
    console.log(`[UserRepository] 사용자 조회: nickname=${nickname}`);
    const user = await this.prisma.user.findFirst({
      where: { nickname },
      include: {
        role: true,
        socialAccounts: true,
      },
    });
    return user ? this.toDomain(user) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    console.log(`[UserRepository] 사용자 조회: phoneNumber=${phoneNumber}`);
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        role: true,
        socialAccounts: true,
      },
    });
    return user ? this.toDomain(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    console.log(`[UserRepository] 사용자 조회: username=${username}`);
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        role: true,
        socialAccounts: true,
      },
    });
    return user ? this.toDomain(user) : null;
  }

  async findBySocialAccount(provider: string, providerUserId: string): Promise<User | null> {
    console.log(`[UserRepository] 소셜 계정으로 사용자 조회: provider=${provider}, providerUserId=${providerUserId}`);
    const userSocialAccount = await this.prisma.userSocialAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId,
        },
      },
      include: {
        user: {
          include: {
            role: true,
            socialAccounts: true,
          },
        },
      },
    });
    return userSocialAccount ? this.toDomain(userSocialAccount.user) : null;
  }

  async create(user: User): Promise<User> {
    console.log(`[UserRepository] 사용자 생성: id=${user.id}`);
    const createdUser = await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        phoneNumber: user.phoneNumber,
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        gender: user.gender,
        age: user.age,
        birthDate: user.birthDate,
        joinedAt: user.joinedAt,
        leftAt: user.leftAt,
        roleId: user.roleId,
        socialAccounts: {
          create: user.socialAccounts.map((account) => ({
            provider: account.provider,
            providerUserId: account.providerUserId,
          })),
        },
      },
      include: {
        role: true,
        socialAccounts: true,
      },
    });
    return this.toDomain(createdUser);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    console.log(`[UserRepository] 사용자 정보 수정: id=${id}`);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.nickname !== undefined) updateData.nickname = data.nickname;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate;
    if (data.leftAt !== undefined) updateData.leftAt = data.leftAt;
    if (data.roleId !== undefined) updateData.roleId = data.roleId;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
        socialAccounts: true,
      },
    });
    return this.toDomain(updatedUser);
  }

  async delete(id: string): Promise<void> {
    console.log(`[UserRepository] 사용자 영구 삭제: id=${id}`);
    await this.prisma.$transaction([
      this.prisma.matchRequest.deleteMany({ where: { OR: [{ fromUserId: id }, { toUserId: id }] } }),
      this.prisma.userRating.deleteMany({ where: { OR: [{ fromUserId: id }, { toUserId: id }] } }),
      this.prisma.chatMessage.deleteMany({ where: { senderId: id } }),
      this.prisma.chatParticipant.deleteMany({ where: { userId: id } }),
      this.prisma.user.delete({ where: { id } }),
    ]);
  }

  async softDelete(id: string): Promise<User> {
    console.log(`[UserRepository] 사용자 탈퇴 처리: id=${id}`);
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { leftAt: new Date() },
      include: {
        role: true,
        socialAccounts: true,
      },
    });
    return this.toDomain(updatedUser);
  }

  async existsSocialAccount(userId: string): Promise<boolean> {
    console.log(`[UserRepository] 소셜 계정 존재 확인: userId=${userId}`);
    const count = await this.prisma.userSocialAccount.count({
      where: { userId },
    });
    return count > 0;
  }

  async countSocialAccounts(userId: string): Promise<number> {
    console.log(`[UserRepository] 소셜 계정 개수 확인: userId=${userId}`);
    return await this.prisma.userSocialAccount.count({
      where: { userId },
    });
  }

  private toDomain(user: any): User {
    const role = new Role(user.role.id, user.role.code, user.role.name, user.role.createdAt, user.role.updatedAt);

    const socialAccounts = user.socialAccounts.map(
      (account: any) => new UserSocialAccount(account.id, account.userId, account.provider, account.providerUserId),
    );

    return User.create(
      user.id,
      user.name,
      user.nickname,
      user.phoneNumber,
      user.email,
      user.username,
      user.passwordHash,
      user.gender as Gender,
      user.age,
      user.birthDate,
      user.joinedAt,
      user.roleId,
      role,
      socialAccounts,
      user.leftAt,
      user.createdAt,
      user.updatedAt,
    );
  }
}
