import { Injectable, Inject } from '@nestjs/common';
import { AuthService } from '@module/user/application/services/auth.service';
import { RefreshTokenService } from '@module/user/application/services/refresh-token.service';
import { LoginResponseDto, UserDto } from '@module/user/application/dto/user.dto';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { UnauthorizedException } from '@common/exceptions/application.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {
    this.logger.log('RefreshAccessTokenUseCase 초기화', 'RefreshAccessTokenUseCase');
  }

  async execute(refreshToken: string): Promise<LoginResponseDto> {
    this.logger.log('액세스 토큰 갱신 실행', 'RefreshAccessTokenUseCase');

    if (!refreshToken) {
      this.logger.warn('액세스 토큰 갱신 실패: 리프레시 토큰 없음', 'RefreshAccessTokenUseCase');
      throw new UnauthorizedException('리프레시 토큰이 필요합니다.');
    }

    try {
      const { userId } = await this.refreshTokenService.validateRefreshToken(refreshToken);
      const user = await this.userRepository.findById(userId);

      if (!user || !user.isActive()) {
        this.logger.warn('액세스 토큰 갱신 실패: 사용자 없음 또는 비활성', 'RefreshAccessTokenUseCase', { userId });
        throw new UnauthorizedException('사용자를 찾을 수 없거나 비활성 상태입니다.');
      }

      const accessToken = await this.authService.generateAccessToken(user);
      const newRefreshToken = await this.refreshTokenService.rotateRefreshToken(refreshToken);

      this.logger.log('액세스 토큰 갱신 성공', 'RefreshAccessTokenUseCase', { userId });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: UserDto.fromDomain(user),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('액세스 토큰 갱신 실패', 'RefreshAccessTokenUseCase', { error: errorMessage });
      throw error;
    }
  }
}
