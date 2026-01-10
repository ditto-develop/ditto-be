import { Injectable, Inject } from '@nestjs/common';
import { RefreshTokenService } from '@module/user/application/services/refresh-token.service';
import { UnauthorizedException } from '@common/exceptions/application.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {
    this.logger.log('LogoutUseCase 초기화', 'LogoutUseCase');
  }

  async execute(refreshToken: string): Promise<void> {
    this.logger.log('로그아웃 실행', 'LogoutUseCase');

    if (!refreshToken) {
      this.logger.warn('로그아웃 실패: 리프레시 토큰 없음', 'LogoutUseCase');
      throw new UnauthorizedException('리프레시 토큰이 필요합니다.');
    }

    try {
      const { userId, tokenId } = await this.refreshTokenService.validateRefreshToken(refreshToken);

      await this.refreshTokenService.revokeRefreshToken(userId, tokenId);
      await this.refreshTokenService.revokeAllUserTokens(userId);

      this.logger.log('로그아웃 성공', 'LogoutUseCase', { userId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('로그아웃 실패', 'LogoutUseCase', { error: errorMessage });
      throw error;
    }
  }
}
