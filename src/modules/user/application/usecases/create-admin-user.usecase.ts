import { BusinessRuleException } from '@common/exceptions/domain.exception';
import { Inject, Injectable } from '@nestjs/common';
import { RoleCode } from '@module/role/domain/entities/role.entity';
import {
  ROLE_REPOSITORY_TOKEN,
  IRoleRepository,
} from '@module/role/infrastructure/repository/role.repository.interface';
import { Gender, User } from '@module/user/domain/entities/user.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { AuthService } from '@module/user/application/services/auth.service';
import { CreateAdminUserDto } from '@module/user/application/dto/user.dto';

@Injectable()
export class CreateAdminUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
    @Inject(ROLE_REPOSITORY_TOKEN) private readonly roleRepo: IRoleRepository,
    private readonly authService: AuthService,
  ) {
    console.log('[CreateAdminUserUseCase] CreateAdminUserUseCase 초기화');
  }

  async execute(dto: CreateAdminUserDto): Promise<User> {
    console.log(`[CreateAdminUserUseCase] 관리자 계정 생성 실행: username=${dto.username}`);

    // 역할 검증 (관리자 역할만 허용)
    const role = await this.roleRepo.findById(dto.roleId);
    if (!role || (role.code !== RoleCode.ADMIN && role.code !== RoleCode.SUPER_ADMIN)) {
      throw new BusinessRuleException('유효하지 않은 관리자 역할입니다.');
    }

    // 중복 검증
    if (await this.userRepo.findByUsername(dto.username)) {
      throw new BusinessRuleException('이미 존재하는 사용자명입니다.');
    }
    if (dto.email && (await this.userRepo.findByEmail(dto.email))) {
      throw new BusinessRuleException('이미 존재하는 이메일입니다.');
    }
    if (await this.userRepo.findByPhoneNumber(dto.phoneNumber)) {
      throw new BusinessRuleException('이미 존재하는 전화번호입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await this.authService.hashPassword(dto.password);

    // 사용자 생성
    const user = User.create(
      crypto.randomUUID(), // 새로운 UUID 생성
      dto.name,
      dto.nickname,
      dto.phoneNumber,
      dto.email || null,
      dto.username,
      hashedPassword,
      dto.gender as Gender,
      dto.age,
      dto.birthDate || null,
      new Date(), // joinedAt
      dto.roleId,
      role,
      [], // 관리자는 소셜 계정 없음
    );

    // 유효성 검증
    user.validate();

    return await this.userRepo.create(user);
  }
}
