import { BusinessRuleException } from '@common/exceptions/domain.exception';
import { Inject, Injectable } from '@nestjs/common';
import { RoleCode } from '@module/role/domain/entities/role.entity';
import {
  ROLE_REPOSITORY_TOKEN,
  IRoleRepository,
} from '@module/role/infrastructure/repository/role.repository.interface';
import { Gender, User } from '@module/user/domain/entities/user.entity';
import { UserSocialAccount } from '@module/user/domain/entities/user-social-account.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { CreateUserDto } from '@module/user/application/dto/user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
    @Inject(ROLE_REPOSITORY_TOKEN) private readonly roleRepo: IRoleRepository,
  ) {
    console.log('[CreateUserUseCase] CreateUserUseCase 초기화');
  }

  async execute(dto: CreateUserDto): Promise<User> {
    console.log(
      `[CreateUserUseCase] 일반 사용자 계정 생성 실행: provider=${dto.provider}, providerUserId=${dto.providerUserId}`,
    );

    // 일반 사용자 역할 조회
    const role = await this.roleRepo.findByCode(RoleCode.USER);
    if (!role) {
      throw new BusinessRuleException('일반 사용자 역할을 찾을 수 없습니다.');
    }

    // 소셜 계정 중복 검증
    const existingUser = await this.userRepo.findBySocialAccount(dto.provider, dto.providerUserId);
    if (existingUser) {
      throw new BusinessRuleException('이미 등록된 소셜 계정입니다.');
    }

    // 전화번호 중복 검증
    if (await this.userRepo.findByPhoneNumber(dto.phoneNumber)) {
      throw new BusinessRuleException('이미 존재하는 전화번호입니다.');
    }

    // 이메일 중복 검증 (있는 경우)
    if (dto.email && (await this.userRepo.findByEmail(dto.email))) {
      throw new BusinessRuleException('이미 존재하는 이메일입니다.');
    }

    // 닉네임 중복 검증
    if (await this.userRepo.findByNickname(dto.nickname)) {
      throw new BusinessRuleException('이미 존재하는 닉네임입니다.');
    }

    // 소셜 계정 생성
    const socialAccount = UserSocialAccount.create(
      0, // ID는 DB에서 자동 생성
      '', // userId는 나중에 설정
      dto.provider,
      dto.providerUserId,
    );

    // 사용자 생성
    const user = User.create(
      crypto.randomUUID(),
      dto.name,
      dto.nickname,
      dto.phoneNumber,
      dto.email || null,
      null, // 일반 사용자는 username 없음
      null, // 일반 사용자는 passwordHash 없음
      dto.gender as Gender,
      dto.age,
      dto.birthDate || null,
      new Date(),
      role.id,
      role,
      [socialAccount],
    );

    // 유효성 검증
    user.validate();

    return await this.userRepo.create(user);
  }
}
