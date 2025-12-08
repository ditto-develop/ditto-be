import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenService } from '@module/user/application/services/refresh-token.service';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  async execute(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 필요합니다.');
    }

    const { userId, tokenId } = await this.refreshTokenService.validateRefreshToken(refreshToken);

    await this.refreshTokenService.revokeRefreshToken(userId, tokenId);
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }
}
