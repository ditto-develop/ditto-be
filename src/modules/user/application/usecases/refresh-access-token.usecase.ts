import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { AuthService } from '@module/user/application/services/auth.service';
import { RefreshTokenService } from '@module/user/application/services/refresh-token.service';
import { LoginResponseDto, UserDto } from '@module/user/application/dto/user.dto';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';

@Injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(refreshToken: string): Promise<LoginResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 필요합니다.');
    }

    const { userId } = await this.refreshTokenService.validateRefreshToken(refreshToken);
    const user = await this.userRepository.findById(userId);

    if (!user || !user.isActive()) {
      throw new UnauthorizedException('사용자를 찾을 수 없거나 비활성 상태입니다.');
    }

    const accessToken = await this.authService.generateAccessToken(user);
    const newRefreshToken = await this.refreshTokenService.rotateRefreshToken(refreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: UserDto.fromDomain(user),
    };
  }
}
