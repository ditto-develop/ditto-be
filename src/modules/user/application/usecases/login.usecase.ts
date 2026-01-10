import { Injectable, Inject } from '@nestjs/common';
import { AuthService } from '@module/user/application/services/auth.service';
import { RefreshTokenService } from '@module/user/application/services/refresh-token.service';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { LoginDto, SocialLoginDto, LoginResponseDto, UserDto } from '@module/user/application/dto/user.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {
    this.logger.log('LoginUseCase 초기화', 'LoginUseCase');
  }

  /**
   * 관리자 로그인 처리
   */
  async executeAdminLogin(dto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log('관리자 로그인 시도', 'LoginUseCase', { username: dto.username });

    // 사용자명으로 사용자 조회
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) {
      this.logger.warn('관리자 로그인 실패: 사용자를 찾을 수 없음', 'LoginUseCase', { username: dto.username });
      throw new EntityNotFoundException('관리자', dto.username);
    }

    // 관리자 권한 확인
    if (!user.isAdmin()) {
      this.logger.warn('관리자 로그인 실패: 관리자 권한 없음', 'LoginUseCase', { userId: user.id, username: dto.username });
      throw new BusinessRuleException('관리자 권한이 필요합니다.', 'INSUFFICIENT_ADMIN_PRIVILEGES');
    }

    // 사용자 활성 상태 확인
    if (!user.isActive()) {
      this.logger.warn('관리자 로그인 실패: 비활성 사용자', 'LoginUseCase', { userId: user.id, username: dto.username });
      throw new BusinessRuleException('탈퇴한 사용자입니다.', 'USER_DEACTIVATED');
    }

    // 비밀번호 검증
    if (!user.passwordHash) {
      this.logger.warn('관리자 로그인 실패: 비밀번호 미설정', 'LoginUseCase', { userId: user.id, username: dto.username });
      throw new BusinessRuleException('비밀번호가 설정되지 않았습니다.', 'PASSWORD_NOT_SET');
    }

    const isPasswordValid = await this.authService.comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn('관리자 로그인 실패: 비밀번호 불일치', 'LoginUseCase', { userId: user.id, username: dto.username });
      throw new BusinessRuleException('비밀번호가 일치하지 않습니다.', 'INVALID_PASSWORD');
    }

    // JWT 토큰 생성
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(user.id);

    this.logger.log('관리자 로그인 성공', 'LoginUseCase', { userId: user.id, username: dto.username });

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
    this.logger.log('소셜 로그인 시도', 'LoginUseCase', {
      provider: dto.provider,
      providerUserId: dto.providerUserId
    });

    // 소셜 계정으로 사용자 조회
    const user = await this.userRepository.findBySocialAccount(dto.provider, dto.providerUserId);
    if (!user) {
      this.logger.warn('소셜 로그인 실패: 소셜 계정을 찾을 수 없음', 'LoginUseCase', {
        provider: dto.provider,
        providerUserId: dto.providerUserId
      });
      throw new EntityNotFoundException(`소셜 계정 (${dto.provider}:${dto.providerUserId})`, '소셜 계정');
    }

    // 사용자 활성 상태 확인
    if (!user.isActive()) {
      this.logger.warn('소셜 로그인 실패: 비활성 사용자', 'LoginUseCase', {
        userId: user.id,
        provider: dto.provider,
        providerUserId: dto.providerUserId
      });
      throw new BusinessRuleException('탈퇴한 사용자입니다.', 'USER_DEACTIVATED');
    }

    // JWT 토큰 생성
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(user.id);

    this.logger.log('소셜 로그인 성공', 'LoginUseCase', {
      userId: user.id,
      provider: dto.provider,
      providerUserId: dto.providerUserId
    });

    return {
      accessToken,
      refreshToken,
      user: UserDto.fromDomain(user),
    };
  }
}
