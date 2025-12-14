import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { AuthService } from '@module/user/application/services/auth.service';
import { RefreshTokenService } from '@module/user/application/services/refresh-token.service';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { LoginDto, SocialLoginDto, LoginResponseDto, UserDto } from '@module/user/application/dto/user.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {
    console.log('[LoginUseCase] LoginUseCase 초기화');
  }

  /**
   * 관리자 로그인 처리
   */
  async executeAdminLogin(dto: LoginDto): Promise<LoginResponseDto> {
    console.log(`[LoginUseCase] 관리자 로그인 시도: username=${dto.username}`);

    // 사용자명으로 사용자 조회
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) {
      throw new EntityNotFoundException('관리자', dto.username);
    }

    // 관리자 권한 확인
    if (!user.isAdmin()) {
      throw new BusinessRuleException('관리자 권한이 필요합니다.', 'INSUFFICIENT_ADMIN_PRIVILEGES');
    }

    // 사용자 활성 상태 확인
    if (!user.isActive()) {
      throw new BusinessRuleException('탈퇴한 사용자입니다.', 'USER_DEACTIVATED');
    }

    // 비밀번호 검증
    if (!user.passwordHash) {
      throw new BusinessRuleException('비밀번호가 설정되지 않았습니다.', 'PASSWORD_NOT_SET');
    }

    const isPasswordValid = await this.authService.comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BusinessRuleException('비밀번호가 일치하지 않습니다.', 'INVALID_PASSWORD');
    }

    // JWT 토큰 생성
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(user.id);

    console.log(`[LoginUseCase] 관리자 로그인 성공: userId=${user.id}`);

    return {
      accessToken,
      refreshToken,
      user: UserDto.fromDomain(user),
    };
  }

  /**
   * 소셜 로그인 처리
   */
  async executeSocialLogin(dto: SocialLoginDto): Promise<LoginResponseDto> {
    console.log(`[LoginUseCase] 소셜 로그인 시도: provider=${dto.provider}, providerUserId=${dto.providerUserId}`);

    // 소셜 계정으로 사용자 조회
    const user = await this.userRepository.findBySocialAccount(dto.provider, dto.providerUserId);
    if (!user) {
      throw new EntityNotFoundException(`소셜 계정 (${dto.provider}:${dto.providerUserId})`, '소셜 계정');
    }

    // 사용자 활성 상태 확인
    if (!user.isActive()) {
      throw new BusinessRuleException('탈퇴한 사용자입니다.', 'USER_DEACTIVATED');
    }

    // JWT 토큰 생성
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(user.id);

    console.log(`[LoginUseCase] 소셜 로그인 성공: userId=${user.id}`);

    return {
      accessToken,
      refreshToken,
      user: UserDto.fromDomain(user),
    };
  }
}
