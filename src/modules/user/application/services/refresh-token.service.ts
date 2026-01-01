import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@module/common/redis/redis.service';
import { randomUUID } from 'crypto';
import { UnauthorizedException } from '@common/exceptions/application.exception';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    console.log('[RefreshTokenService] RefreshTokenService 초기화');
  }

  /**
   * 리프레시 토큰 발급 및 Redis 저장
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const tokenId = randomUUID();
    const payload = {
      sub: userId,
      tokenId,
      type: 'refresh',
    };

    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn = (this.configService.get<string>('jwt.refreshExpiresIn') ??
      '14d') as SignOptions['expiresIn'];

    const signOptions: JwtSignOptions = {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    };

    const refreshToken = this.jwtService.sign(payload, signOptions);

    // Redis에 토큰 저장 (TTL: 설정 기반, 기본 14일)
    const ttlSeconds = this.parseTtlSeconds(refreshExpiresIn, 14 * 24 * 60 * 60);
    const redisKey = `refresh_token:${userId}:${tokenId}`;
    await this.redisService.set(redisKey, 'valid', ttlSeconds);

    console.log(`[RefreshTokenService] 리프레시 토큰 발급: userId=${userId}, tokenId=${tokenId}`);
    return refreshToken;
  }

  /**
   * 리프레시 토큰 검증 및 사용자 ID 반환
   */
  async validateRefreshToken(refreshToken: string): Promise<{ userId: string; tokenId: string }> {
    try {
      const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      if (payload.type !== 'refresh' || !payload.sub || !payload.tokenId) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      const userId = payload.sub;
      const tokenId = payload.tokenId;
      const redisKey = `refresh_token:${userId}:${tokenId}`;

      // Redis에서 토큰 존재 확인
      const exists = await this.redisService.exists(redisKey);
      if (exists === 0) {
        throw new UnauthorizedException('만료되었거나 무효화된 리프레시 토큰입니다.');
      }

      console.log(`[RefreshTokenService] 리프레시 토큰 검증 성공: userId=${userId}`);
      return { userId, tokenId };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[RefreshTokenService] 리프레시 토큰 검증 실패:', message);
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  /**
   * 리프레시 토큰 회전 (이전 토큰 폐기 후 새 토큰 발급)
   */
  async rotateRefreshToken(oldRefreshToken: string): Promise<string> {
    try {
      const { userId, tokenId: oldTokenId } = await this.validateRefreshToken(oldRefreshToken);

      // 이전 토큰 삭제
      const oldRedisKey = `refresh_token:${userId}:${oldTokenId}`;
      await this.redisService.delete(oldRedisKey);

      console.log(`[RefreshTokenService] 이전 리프레시 토큰 폐기: userId=${userId}, oldTokenId=${oldTokenId}`);

      // 새 토큰 발급
      return await this.generateRefreshToken(userId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[RefreshTokenService] 리프레시 토큰 회전 실패:', message);
      throw new UnauthorizedException('토큰 회전에 실패했습니다.');
    }
  }

  /**
   * 사용자별 모든 리프레시 토큰 폐기 (로그아웃 시 사용)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      const pattern = `refresh_token:${userId}:*`;
      await this.redisService.deleteByPattern(pattern);
      console.log(`[RefreshTokenService] 사용자 리프레시 토큰 모두 폐기: userId=${userId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[RefreshTokenService] 사용자 토큰 폐기 실패:', message);
      // 로그아웃 실패는 치명적이지 않으므로 예외를 던지지 않습니다.
    }
  }

  /**
   * 특정 리프레시 토큰 폐기
   */
  async revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
    try {
      const redisKey = `refresh_token:${userId}:${tokenId}`;
      await this.redisService.delete(redisKey);
      console.log(`[RefreshTokenService] 리프레시 토큰 폐기: userId=${userId}, tokenId=${tokenId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[RefreshTokenService] 토큰 폐기 실패:', message);
      throw new UnauthorizedException('토큰 폐기에 실패했습니다.');
    }
  }

  private parseTtlSeconds(duration: string | undefined, defaultSeconds: number): number {
    if (!duration) return defaultSeconds;

    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return defaultSeconds;
    }

    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return defaultSeconds;
    }
  }
}
